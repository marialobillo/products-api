const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 1, 
        required: [true, 'User needs an username.']
    }, 
    password: {
        type: String, 
        minlength: 1, 
        required: [true, 'User must has a password']
    },
    email: {
        type: String,
        minlength: 1, 
        required: [true, 'User must has an email']
    }
})

module.exports = mongoose.model('user', userSchema)