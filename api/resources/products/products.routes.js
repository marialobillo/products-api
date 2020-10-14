const express = require('express');
const { v4: uuidv4 } = require('uuid');
const _ = require('underscore');

const products = require('./../../../database').products;
const productsRouter = express.Router();

productsRouter.route('/')
    .get((req, res) => {
        res.json(products)
    })
    .post((req, res) => {
        let newProduct = req.body;
        // Input Validation
        if( !newProduct.coin || !newProduct.price || !newProduct.title){
            // Bad Request
            res.status(400).send("Required Fields: title, price, and coin");
            return;
        }
        newProduct.id = uuidv4();
        products.push(newProduct);
        // Created Product
        res.status(201).json(newProduct);
    })

productsRouter.route('/:id')
    .get((req, res) => {
        for(let product of products){
            if(product.id == req.params.id){
                res.json(product);
                return;
            }
        }
        res.status(404).send(`The product with id : [${req.params.id}] is not found.`);
    })
    .put((req, res) => {
        let id = req.params.id;
        let updatedProduct = req.body;
        if(!updatedProduct.coin || !updatedProduct.price || !updatedProduct.title){
            // Bad request
            res.status(400).send("Fields required: title, price and coin");
            return;
        }
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
    .delete((req, res) => {
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

