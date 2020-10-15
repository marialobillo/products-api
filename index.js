const express = require('express');
const app = express();
const productsRouter = require('./api/resources/products/products.routes');
const winston = require('winston');

const includeTimestamp = winston.format((info) => {
    info.message = `${new Date().toISOString()} ${info.message}`
    return info
});

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            level: 'info',
            handleExceptions: true, 
            format: winston.format.combine(
                includeTimestamp(),
                winston.format.simple()
            ),
            maxsize: 5120000, // 5 Mb
            maxFiles: 5,
            filename: `${__dirname}/application-logs.log`
        })
    ]
});


// Logs
logger.info('This is a info message');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/products', productsRouter);

app.get('/', (req, res) => {
    res.send('API of shop online')
})

app.listen(3002, () => {
    console.log('Server running on port 3002');
})