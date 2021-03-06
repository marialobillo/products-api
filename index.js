const express = require('express');
const mongoose = require('mongoose');
const winston = require('winston');
const morgan = require('morgan');
const passport = require('passport');

const logger = require('./utils/logger');
const authJWT = require('./api/libs/auth');
const config = require('./config');
const productsRouter = require('./api/resources/products/products.routes');
const usersRouter = require('./api/resources/users/users.routes');
const errorHandler = require('./api/libs/errorHandler');


// Authentication using password and username
passport.use(authJWT);

// Database connection
mongoose.connect(config.mongoURI, {
    useUnifiedTopology: true, 
    useNewUrlParser: true
})
mongoose.connection.on('error', () => {
    logger.error('Connection Failed MongoDB');
    process.exit(1);
})

// Middleware
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message.trim())
    }
}));


app.use(passport.initialize());

app.use('/products', productsRouter);
app.use('/users', usersRouter);

app.use(errorHandler.processErrorsFromDB);
if(config.environment === 'prod'){
    app.use(errorHandler.errorsOnProduction)
} else {
    app.use(errorHandler.errorsOnDevelopment)
}


const server = app.listen(config.port, () => {
    logger.info('Server running on port 3000');
})

module.exports = {
    app, server
}