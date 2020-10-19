const Joi = require('@hapi/joi');
const logger = require('./../../../utils/logger');

const userSchema = Joi.object({
    username: Joi.string().alphanum().max(30).min(3).required(),
    password: Joi.string().max(200).min(6).required(),
    email: Joi.string().email().required()
});

module.exports = (req, res, next) => {
    const data = req.body;
    const validation = userSchema.validate(data, { 
        abortEarly: false, 
        convert: false 
    });

    if(validation.error === undefined){
        next()
    } else {
        // Bad request
        let validationErrors = `User requirements: username and password. 
            Please the username should be 3-30 chars and password 6-200 chars, 
            and the email is required also. Thanks you!`;
        logger.warn('We could not validate the user', req.body, validation.error.details)
        res.status(400).send(validationErrors);
    }
}

