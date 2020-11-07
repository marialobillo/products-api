const Product = require('./products.model');

function createProduct(product, owner){
    return new Product({
        ...product, 
        owner
    }).save()
}

function getProducts(){
    return Product.find({})
}

function getProductById(id){
    return Product.findById(id)
}

module.exports = {
    createProduct,
    getProducts,
    getProductById
}