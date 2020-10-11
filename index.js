const express = require('express');

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