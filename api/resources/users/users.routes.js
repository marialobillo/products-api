const express = require('express');
const _ = require('underscore');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./../../../config');

const logger = require('../../../utils/logger');
const validateUser = require('./users.validate').userValidation;
const orderLoginValidation = require('./users.validate').orderLoginValidation;

const users = require('../../../database').users;
const usersRouter = express.Router();

usersRouter.get('/', (req, res) => {
    res.json(users);
});

usersRouter.post('/', validateUser, (req, res) => {
    let newUser = req.body;

    let index = _.findIndex(users, user => {
        return user.username === newUser.username || user.email === newUser.email;
    })

    if(index !== -1){
        // Conflict
        logger.info('Email or username already exist on database.');
        res.status(409).send('The email or username already exist.');
        return;
    }

    bcrypt.hash(newUser.password, 10, (error, hashedPassword) => {
        if(error){
            // Internal Server Error
            logger.error('Error getting the hash for password', error);
            res.status(500).send("There was an error creating the user");
            return;
        }

        users.push({
            username: newUser.username,
            email: newUser.email,
            password: hashedPassword,
            id: uuidv4()
        });

        res.status(201).send('User created successfully');
    });
});

usersRouter.post('/login', orderLoginValidation, (req, res) => {
    let noAuthUser = req.body
    let index = _.findIndex(users, user => user.username === noAuthUser.username);

    if(index === -1){
        logger.warn(`User ${noAuthUser.username} does not exist.`)
        res.status(400).send('Wrong credentials.User does not exist.')
        return;
    }

    let hashedPassword = users[index].password;
    bcrypt.compare(noAuthUser.password, hashedPassword, (err, equals) => {
        if(equals){
            // Generate and send token
            let token = jwt.sign({ id: users[index].id }, 
                config.jwt.secret,
                { expiresIn: config.jwt.expirationTime })
            logger.info(`User ${noAuthUser.username} completed authentication`)
            res.status(200).json({ token })
        } else {
            logger.info(`User ${noAuthUser.username} does not authenticated. Wrong passowrd`)
            res.status(400).send('Wrong credentials. Please, check them out.')
        }
    })
})

module.exports = usersRouter;