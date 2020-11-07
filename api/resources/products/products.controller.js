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

module.exports = {
    createProduct,
    getProducts
}