let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let request = require('supertest');

let config = require('../../../config');
let Product = require('./products.model');
let User = require('../users/users.model');
let app = require('../../../index').app;
let server = require('../../../index').server;

let productOnDatabase = {
    title: 'Running Shoes Pimus',
    price: 140,
    coin: 'USD',
    owner: 'peter'
}

let idSaved = '5ab8dbcc6539f91c2288b0c1'

describe('Products', () => {

    beforeEach(done => {
        Product.remove({}, error => {
            done()
        })
    })

    afterAll( () => {
        server.close()
    })

    describe('GET /products/:id', () => {
        it('Should return 400 error if we try to get the product with invalid id', done => {
            request(app)
                .get('/products/123')
                .end((error, res) => {
                    expect(res.staus).toBe(400)
                    done()
                })
        })

        it('should return 404 error if we try to get product that does not exist', done => {
            request(app)
                .get(`/products/${idSaved}`)
                .end((error, res) => {
                    expect(res.status).toBe(404)
                    done()
                })
        })
    })
})