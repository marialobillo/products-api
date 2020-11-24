const _ = require('underscore');
const bcrypt = require('bcrypt');
const passportJWT = require('passport-jwt');

const config = require('./../../config');
const logger = require('./../../utils/logger');
const userController = require('../resources/users/users.controller');

// Authorization : bearer token
let jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {

    userController.getUser({ id: jwtPayload.id })
        .then(user => {
            if(!user){
                logger.info(`JWT token is not valid. User with id ${jwtPayload.id} does not exist.`);
                next(null, false);
                return;
            }

            logger.info(`User ${user.username} got a valid token. Auth OK`);
            next(null, {
                username: user.username, 
                id: user.id
            })
        })
        .catch(error => {
            logger.error('Error trying validating the token', error);
            next(error);
        })

})
