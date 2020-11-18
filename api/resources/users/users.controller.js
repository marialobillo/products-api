const User = require('./users.model');

function getUsers(){
    return User.find({})
}

module.exports = {
    getUsers
}