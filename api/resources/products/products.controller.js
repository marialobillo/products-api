const Product = require('./products.model');

function createProduct(product, owner){
    return new Product({
        ...product, 
        owner
    }).save()
}

module.exports = {
    createProduct
}