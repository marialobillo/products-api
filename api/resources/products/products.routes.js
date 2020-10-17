const express = require('express');
const { v4: uuidv4 } = require('uuid');
const _ = require('underscore');
const productValidation = require('./products.validate');
const logger = require('./../../../utils/logger')

const products = require('./../../../database').products;
const productsRouter = express.Router();


productsRouter.get('/', (req, res) => {
        res.json(products)
    })
productsRouter.post('/', productValidation, (req, res) => {
        let newProduct = req.body;
        // Input Validation

        newProduct.id = uuidv4();
        products.push(newProduct);
        logger.info("Product was added to the collection", newProduct);
        // Created Product
        res.status(201).json(newProduct);
    })

productsRouter.get('/:id', (req, res) => {
        for(let product of products){
            if(product.id == req.params.id){
                res.json(product);
                return;
            }
        }
        res.status(404).send(`The product with id : [${req.params.id}] is not found.`);
    })
productsRouter.put('/:id', productValidation, (req, res) => {
        let id = req.params.id;
        let updatedProduct = req.body;

        let index = _.findIndex(products, product => product.id == id);
        if(index !== -1){
            // Update the product
            updatedProduct.id = id;
            products[index] = updatedProduct;
            logger.info(`Product id: [${id}] was updated.`, updatedProduct);
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).send(`The product with id : [${id}] was not found.`);
        }
    })
productsRouter.delete('/:id', (req, res) => {
        let id = req.params.id;
        let indexForDelete = _.findIndex(products, product => product.id == id);
        if(indexForDelete === -1){
            logger.warn(`Product id: [${id}] does not exists.`);
            res.status(404).send(`Product with id: [${id}] does not exist.`);
            return;
        }

        let deleted = products.splice(indexForDelete, 1);
        res.json(deleted);
    });


module.exports = productsRouter;

