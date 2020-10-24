const _ = require('underscore');
const logger = require('./../../utils/logger');
const users = require('./../../database').users;
const bcrypt = require('bcrypt');

module.exports = (username, password, done) => {
    let index = _.findIndex(users, user => user.username == username)

    if(index === -1){
        logger.warn(`User ${username} could not authenticated.`)
        done(null, false)
        return
    } 

    let hashedPassword = users[index].password
    bcrypt.compare(password, hashedPassword, (err, equals) => {
        if(equals){
            logger.info(`User ${username} completed authentication`)
            done(null, true)
        } else {
            logger.warn(`User ${username} did not complete authentication. Wrong pass.`)
            done(null, false)
        }
    })

} 