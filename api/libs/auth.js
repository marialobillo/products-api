const _ = require('underscore');
const logger = require('./../../utils/logger');
const users = require('./../../database').users;
const bcrypt = require('bcrypt');
const passportJWT = require('passport-jwt');
const config = require('./../../config');

let jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
    let index = _.findIndex(users, user => user.id === jwtPayload.id)

    if(index === -1){
        logger.info(`JWT token is not valid. User with id ${jwtPayload.id} does not exist.`);
        next(null, false);
    } else {
        logger.info(`User ${users[index].username} got a valid token. Auth OK`);
        next(null, {
            username: users[index].username,
            id: users[index].id
        });
    }

})