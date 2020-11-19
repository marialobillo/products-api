const User = require('./users.model');

function getUsers(){
    return User.find({})
}

function createUser(user, hashedPassword){
    return new User({
        ...user, 
        password: hashedPassword
    }).save()
}

function userExists(username, email){
    return new Promise((resolve, reject) => {
        User.find().or([ {'username': username}, {'email': email} ])
            .then(users => {
                resolve(users.length > 0)
            })
            .catch(error => {
                reject(error)
            })
    })
}

module.exports = {
    getUsers,
    createUser, 
    userExists
}