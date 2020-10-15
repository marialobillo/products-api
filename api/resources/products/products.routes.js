const express = require('express');
const { v4: uuidv4 } = require('uuid');
const _ = require('underscore');
const Joi = require('@hapi/joi');

const products = require('./../../../database').products;
const productsRouter = express.Router();

const productSchema = Joi.object({
    title: Joi.string().max(100).required(),
    price: Joi.number().positive().precision(2).required(),
    coin: Joi.string().length(3).uppercase().required()
});

const productValidation = (req, res, next) => {
    const data = req.body;
    const validation = productSchema.validate(data, {
        abortEarly: false, 
        convert: false
    });

    if(validation.error === undefined){
        next()
    } else {
        let validationErrors = validation.error.details.reduce((acumulator, error) => {
            return acumulator + `[${error.message}]`;
        }, '');
        console.log(validationErrors);
        res.status(400).send(validationErrors);
    }
}

productsRouter.get('/', (req, res) => {
        res.json(products)
    })
productsRouter.post('/', productValidation, (req, res) => {
        let newProduct = req.body;
        // Input Validation

        newProduct.id = uuidv4();
        products.push(newProduct);
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
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).send(`The product with id : [${id}] was not found.`);
        }
    })
productsRouter.delete('/:id', (req, res) => {
        let id = req.params.id;
        let indexForDelete = _.findIndex(products, product => product.id == id);
        if(indexForDelete === -1){
            res.status(404).send(`Product with id: [${id}] does not exist.`);
            return;
        }

        let deleted = products.splice(indexForDelete, 1);
        res.json(deleted);
    });


module.exports = productsRouter;

