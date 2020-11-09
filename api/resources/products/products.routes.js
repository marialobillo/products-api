const express = require('express');
const { v4: uuidv4 } = require('uuid');
const _ = require('underscore');
const productValidation = require('./products.validate');
const logger = require('./../../../utils/logger')
const passport = require('passport');

const jwtAuthenticate = passport.authenticate('jwt', { session: false });
const products = require('./../../../database').products;
const productsRouter = express.Router();
const Product = require('./products.model');

function validateId(req, res, next){
    let id = req.params.id 
    // regex
    if(id.match(/^[a-fA-F0-9]{24}$/) === null){
        res.status(400).send(`Id ${id} is not a valid Id`)
        return
    } 
    next()
}

productsRouter.get('/', (req, res) => {
    productController.getProducts()
        .then(products => {
            res.json(products)
        })
        .catch(err => {
            res.status(500).send("There was an error Create Product from Database")
        })
})

productsRouter.post('/', [jwtAuthenticate, productValidation], (req, res) => {

    productController.createProduct(req.body, req.user.username)
        .then(product => {
            logger.info("Product was added to the collection", product);
            res.status(201).json(product);        
        })
        .catch(err => {
            logger.error('Product could not be created', err);
            res.status(500).send('Error ocurred during create product');
        })

})

productsRouter.get('/:id', validateId, (req, res) => {
    let id = req.params.id 
    
    productController.getProductById(id)
        .then(product => {
            if(!product){
                res.status(404).send(`Product with id : [${id}] was not found.`);
            } else {
                res.json(product)
            }
        })
        .catch(err => {
            logger.error(`Exception ocurred: Product id: ${id}`, err)
            res.status(500).send(`Error with Product id: ${id}`)
        })
    
})

productsRouter.put('/:id', [jwtAuthenticate, productValidation], (req, res) => {
    let updatedProduct = {
        ...req.body.username,
        id: req.params.id,
        owner: req.user.username 
    }
    
    let index = _.findIndex(products, product => product.id == updatedProduct.id);
    if(index !== -1){
        if(products[index].owner !== updatedProduct.owner){
            logger.info(`User ${req.user.username} is not the owner of id ${updatedProduct.id}`);
            res.status(401).send(`You are not the owner of ${updatedProduct.id}. You can update only your products.`)
            return
        }
        // Update the product
        products[index] = updatedProduct;
        logger.info(`Product id: [${updatedProduct.id}] was updated.`, updatedProduct);
        res.status(200).json(updatedProduct);
    } else {
        res.status(404).send(`The product with id : [${updatedProduct.id}] was not found.`);
    }
})

productsRouter.delete('/:id', [jwtAuthenticate, validateId], async (req, res) => {
    let id = req.params.id;
    let product

    try {
        product = await productController.getProductById(id)
    } catch (error) {
        logger.error(`Error on delete the product with id: ${id}`)
        res.status(404).send(`Product with id: ${id} does not exist.`)
    }

    if(product === -1){
        logger.info(`Product id: [${id}] does not exists.`);
        res.status(404).send(`Product with id: [${id}] does not exist.`);
        return;
    }

    let userAuthenticated = req.user.username
    if(product.owner !== userAuthenticated){
        logger.info(`User ${userAuthenticated} is not the owner of id ${id}`);
        res.status(401).send(`You are not the owner of ${id}. You can delete only your products.`)
        return
    }

    try {
        let deletedProduct = await productController.deleteProduct(id)
        logger.info(`Product with ID: ${id} was deleted`)
        res.json(deletedProduct)
    } catch (error) {
        res.status(500).send(`Error on deleting product with id: ${id}`)
    }

});


module.exports = productsRouter;

