const express = require('express');
const _ = require('underscore');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./../../../config');

const userController = require('./users.controller');
const logger = require('../../../utils/logger');
const validateUser = require('./users.validate').userValidation;
const orderLoginValidation = require('./users.validate').orderLoginValidation;

const users = require('../../../database').users;
const usersRouter = express.Router();

function transformBodyLowercase(req, res, next) {
    req.body.username && (req.body.username = req.body.username.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}

usersRouter.get('/', (req, res) => {
    userController.getUsers()
        .then(users => {
            res.json(users)
        })
        .catch(error => {
            log.error('Error on getting all Users', error)
            res.sendStatus(500)
        })
});

usersRouter.post('/', [validateUser, transformBodyLowercase], (req, res) => {
    let newUser = req.body;

    userController.userExists(newUser.username, newUser.email)
    .then(userExists => {
        if(userExists){
            logger.warn(`Email ${newUser.email} or username ${newUser.username} already exists.`)
            res.status(409).send('The email or username already associate to an account')
            return
        }

        bcrypt.hash(newUser.password, 10, (error, hashedPassword) => {
            if(error){
                logger.error('Error trying to get password hash', err)
                res.status(500).send('Error on creating the User')
                return
            }

            userController.createUser(newUser, hashedPassword)
                .then(newUser => {
                    res.status(201).send('User create successfully')
                })
                .catch(error => {
                    logger.error('Error trying to create a new User', error)
                    res.status(500).send('Error trying to create a new User')
                })
        })
    })
    .catch(error => {
        logger.error(`Error on User verification ${newUser.username}`)
        res.status(500).send('Error when we try to create a new User')
    })

  
});

usersRouter.post('/login', [orderLoginValidation, transformBodyLowercase], (req, res) => {
    let noAuthUser = req.body
    let userRegistered 

    try {
        userRegistered = await usersController.getUser({
            username: noAuthUser.username
        })
    } catch (error) {
        looger.error(`Error on checking out the user ${noAuthUser.username} was registered.`)
        res.status(500).send('Error on login process')
        return
    }

    if(!userRegistered){
        logger.info(`User ${noAuthUser.username} does not exist.`)
        res.status(400).send('User and password are not correct')
        return
    }

    let correctPassword 
    try {
        correctPassword = await bcrypt.compare(noAuthUser.password, userRegistered.password)
    } catch (error) {
        logger.error('Error on validation password', error)
        res.status(500).send('Error on login process')
        return
    }

    if(correctPassword){
        // Generate and send token
        let token = jwt.sign(
            { id: userRegistered.id }, 
            config.jwt.secret, 
            { expiresIn: config.jwt.expirationTime })
        logger.info(`User ${noAuthUser.username} completed authentication.`)
        res.status(200).json({ token })
    } else {
        logger.info(`User ${noAuthUser.username} does not authenticated auth. Password not correct.`);
        res.status(400).send('Wrong credentials. Please, check them out.')
    }




    
})

module.exports = usersRouter;