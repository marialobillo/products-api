const express = require('express');
const { v4: uuidv4 } = require('uuid');
const _ = require('underscore');
const productValidation = require('./products.validate');
const logger = require('./../../../utils/logger')
const passport = require('passport');

const jwtAuthenticate = passport.authenticate('jwt', { session: false });
const productsRouter = express.Router();
const productController = require('./products.controller');
const processErrors = require('../../libs/errorHandler').processErrors;
const { ProductNoExists, UserNoOwner} = require('./products.error');
const usersController = require('../users/users.controller');

function validateId(req, res, next){
    let id = req.params.id 
    // regex
    if(id.match(/^[a-fA-F0-9]{24}$/) === null){
        res.status(400).send(`Id ${id} is not a valid Id`)
        return
    } 
    next()
}

productsRouter.get('/', processErrors((req, res) => {
    return productController.getProducts()
        .then(products => {
            res.json(products)
        })
}))

productsRouter.post('/', [jwtAuthenticate, productValidation], processErrors((req, res) => {

    return productController.createProduct(req.body, req.user.username)
        .then(product => {
            logger.info("Product was added to the collection", product.toObject());
            res.status(201).json(product);        
        })

}))

productsRouter.get('/:id', validateId, processErrors((req, res) => {
    let id = req.params.id

    return productController.getProductById(id)
        .then(product => {
            if(!product) throw new ProductNoExists(`Product with id : [${id}] was not found.`)

            res.json(product)
        })

}))

productsRouter.put('/:id', [jwtAuthenticate, productValidation], processErrors(async (req, res) => {
    let id = req.params.id
    let userAuthenticated = req.user.username 
    let productUpdated 

    productUpdated = await productController.getProductById(id)

    if(!productUpdated) throw new ProductNoExists(`Product with id : [${id}] was not found.`)

    if(!productUpdated.owner !== userAuthenticated){
        logger.warn(`User ${userAuthenticated} is not the owner of ${id} Product`)
        throw new UserNoOwner(`You are not the owner of ${id} product.`)
    }

    productController.updateProduct(id, req.body, userAuthenticated)
        .then(product => {
            res.json(product)
            logger.info(`Product ${id} was updated`, product.toObject())
        })

}))

productsRouter.delete('/:id', [jwtAuthenticate, validateId], processErrors(async (req, res) => {
    let id = req.params.id;
    let product

    product = await productController.getProductById(id)

    if(product === -1){
        logger.info(`Product id: [${id}] does not exists.`);
        throw new ProductNoExists(`Product with id : [${id}] was not found.`)
    }

    let userAuthenticated = req.user.username
    if(product.owner !== userAuthenticated){
        logger.info(`User ${userAuthenticated} is not the owner of id ${id}`);
        throw new UserNoOwner(`You are not the owner of ${id}. You can delete only your products.`)
    }

    let deletedProduct = await productController.deleteProduct(id)
    logger.info(`Product with ID: ${id} was deleted`)
    res.json(deletedProduct)

}))


module.exports = productsRouter;

