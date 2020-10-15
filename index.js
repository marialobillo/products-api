const express = require('express');
const app = express();
const productsRouter = require('./api/resources/products/products.routes');
const winston = require('winston');
const morgan = require('morgan');
const logger = require('./utils/logger');


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message.trim())
    }
}));

app.use('/products', productsRouter);

app.get('/', (req, res) => {
    res.send('API of shop online')
})

app.listen(3002, () => {
    logger.info('Server running on port 3002');
})