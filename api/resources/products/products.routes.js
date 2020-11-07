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

productsRouter.get('/:id', (req, res) => {
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

productsRouter.delete('/:id', jwtAuthenticate, (req, res) => {
    let id = req.params.id;
    let indexForDelete = _.findIndex(products, product => product.id == id);
    if(indexForDelete === -1){
        logger.warn(`Product id: [${id}] does not exists.`);
        res.status(404).send(`Product with id: [${id}] does not exist.`);
        return;
    }

    if(products[indexForDelete].owner !== req.user.username){
        logger.info(`User ${req.user.username} is not the owner of id ${products[indexForDelete].id}`);
        res.status(401).send(`You are not the owner of ${products[indexForDelete].id}. You can delete only your products.`)
        return
    }

    let deleted = products.splice(indexForDelete, 1);
    res.json(deleted);
});


module.exports = productsRouter;

