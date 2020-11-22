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

function getUser({username: username, id: id}){
    if(username)return User.findOne({ username: username })
    if(id) return User.findById(id)
    throw new Error('For getting an User we need username or id')
}

module.exports = {
    getUsers,
    createUser, 
    userExists,
    getUser
}