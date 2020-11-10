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

function deleteProductById(id){
    return Product.findByIdAndRemove(id)
}

function updateProduct(id, product, username){
    return Product.findOneAndUpdate(
        { id: id },
        {
            ...product,
            owner: username
        }, {
            new: true
        })
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    deleteProductById,
    updateProduct
}