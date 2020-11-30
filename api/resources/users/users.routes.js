const express = require('express');
const _ = require('underscore');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./../../../config');

const userController = require('./users.controller');
const logger = require('../../../utils/logger');
const { response } = require('express');
const usersController = require('./users.controller');
const validateUser = require('./users.validate').userValidation;
const orderLoginValidation = require('./users.validate').orderLoginValidation;
const processErrors = require('../../libs/errorHandler').processErrors;
const { UserDataInUse, IncorrectCredentials } = require('./users.error');

const usersRouter = express.Router();

function transformBodyLowercase(req, res, next) {
    req.body.username && (req.body.username = req.body.username.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}

usersRouter.get('/', processErrors((req, res) => {
    return userController.getUsers()
        .then(users => {
            res.json(users)
        })
}))

usersRouter.post('/', [validateUser, transformBodyLowercase], processErrors((req, res) => {
    let newUser = req.body;

    return userController.userExists(newUser.username, newUser.email)
        .then(userExists => {
            if(userExists){
                logger.warn(`Email ${newUser.email} or username ${newUser.username} already exists.`)
               throw new UserDataInUse()
            }

            return bcrypt.hash(newUser.password, 10) 
        })
        .then((hash) => {
            return userController.createUser(newUser, hash)
            .then(newUser => {
                res.status(201).send('User create successfully')
            })
        })

}))

usersRouter.post('/login', [orderLoginValidation, transformBodyLowercase], processErrors(async (req, res) => {
    let noAuthUser = req.body
    let userRegistered 

    userRegistered = await usersController.getUser({
        username: noAuthUser.username
    })
    

    if(!userRegistered){
        logger.info(`User ${noAuthUser.username} does not exist.`)
        throw new IncorrectCredentials();
    }

    let correctPassword 
    correctPassword = await bcrypt.compare(noAuthUser.password, userRegistered.password)

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
        throw new IncorrectCredentials();
    }


}))

module.exports = usersRouter;