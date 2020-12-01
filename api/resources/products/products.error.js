
class ProductNoExists extends Error {
    constructor(message){
        super(message);
        this.message = message || 'Product Does not Exist.'
        this.status = 404
        this.name = 'ProductNoExists'
    }
}

class UserNoOwner extends Error {
    constructor(message){
        super(message){
            this.message = message || 'You are not the product owner.'
            this.status = 401
            this.name = 'UserNotOwner'
        }
    }
}

module.exports = {
    ProductNoExists,
    UserNoOwner
}