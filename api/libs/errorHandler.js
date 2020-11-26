const logger = require("../../utils/logger")


exports.processErrors = (fn) => {
    return function(req, res, next){
        fn(req, res, next).catch((error) => {
            logger.info('Processing Errors: ', error)
        })
    }
}