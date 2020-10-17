const Joi = require('@hapi/joi');
const logger = require('./../../../utils/logger');

const productSchema = Joi.object({
    title: Joi.string().max(100).required(),
    price: Joi.number().positive().precision(2).required(),
    coin: Joi.string().length(3).uppercase().required()
});

module.exports = (req, res, next) => {
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
        logger.warn('We could not validate the product', req.body, validationErrors)
        res.status(400).send(validationErrors);
    }
}



