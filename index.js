const express = require('express');
const productsRouter = require('./api/resources/products/products.routes');
const usersRouter = require('./api/resources/users/users.routes');
const winston = require('winston');
const morgan = require('morgan');
const logger = require('./utils/logger');
const auth = require('./api/libs/auth');

const passport = require('passport');
// Authentication using password and username
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy( auth ));


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

app.get('/', passport.authenticate('basic', { session: false }), (req, res) => {
    res.send('API of shop online')
})

app.listen(3000, () => {
    logger.info('Server running on port 3000');
})