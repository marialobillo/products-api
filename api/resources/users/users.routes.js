const express = require('express');
const _ = require('underscore');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const logger = require('../../../utils/logger');
const validateUser = require('./users.validate');

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
            password: hashedPassword
        });

        res.status(201).send('User created successfully');
    });
});

module.exports = usersRouter;