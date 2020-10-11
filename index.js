const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Database in memory
const products = [
    { id: '1234', title: 't-shirt', price: 40, coin: 'USD'},
    { id: '1235', title: 'jeans', price: 60, coin: 'USD'},
    { id: '1236', title: 'shoes', price: 90, coin: 'USD'}
];

app.route('/products')
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

app.get('/products/:id', (req, res) => {
    for(let product of products){
        if(product.id == req.params.id){
            res.json(product);
            return;
        }
    }
    res.status(404).send(`The product with id : [${req.params.id}] is not found.`);
})

app.get('/', (req, res) => {
    res.send('API of shop online')
})

app.listen(3000, () => {
    console.log('Server running on port 3000');
})