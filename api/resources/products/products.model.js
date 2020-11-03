const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: [true, 'Product needs a title']
    },
    price: {
        type: Number, 
        min: 0,
        required: [true, 'Product needs a price']
    },
    coin: {
        type: String, 
        maxlength: 3, 
        minlength: 3, 
        required: [true, 'Product needs a coin']
    },
    owner: {
        type: String, 
        required: [true, 'Product needs a owner associate']
    }
})

module.exports = mongoose.model('product', productSchema);