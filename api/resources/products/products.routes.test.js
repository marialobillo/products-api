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

let newProduct = {
    title: 'Vivobarefoot Primus Bio II',
    price: 130,
    coin: 'USD'
}

let idSaved = '5ab8dbcc6539f91c2288b0c1'

let testUser = {
    username: 'peter',
    email: 'peter@mail.com',
    password: 'hello123'
}

let authToken
let invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjhkZjliNTM4ZGYyYzliMjU5NTVmZiIsImlhdCI6MTYwNjIxMjg3NCwiZXhwIjoxNjA2Mjk5Mjc0fQ.fViS9zWpdphF1mgr7Jn2VHCecLyKAkxdVguminvalidtoken'

const getAuthToken = done => {

    User.remove({}, error => {
        if(error) done(error)
        request(app)
            .post('/users')
            .send(testUser)
            .end((error, res) => {
                expect(res.status).toBe(201)
                request(app)
                    .post('/users/login')
                    .send({
                        username: testUser.username,
                        password: testUser.password
                    })
                    .end((error, res) => {
                        expect(res.status).toBe(200)
                        authToken = res.body.token 
                        done()
                    })
            })
    })
}

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
                    expect(res.status).toBe(400)
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

        it('Should return the product the it exists successfully', done => {
            Product(productOnDatabase).save()
                .then(product => {
                    request(app)
                        .get(`/products/${product._id}`)
                        .end((error, res) => {
                            expect(res.status).toBe(200)
                            expect(res.body).toBeInstanceOf(Object)
                            expect(res.body.title).toEqual(product.title)
                            expect(res.body.price).toEqual(product.price)
                            expect(res.body.coin).toEqual(product.coin)
                            expect(res.body.owner).toEqual(product.owner)
                            done()
                        })
                })
                .catch(error => {
                    done(error)
                })
        })


    })

    describe('POST /products', () => {

        beforeAll(getAuthToken)
        it('should create a product with a valid token and valid product', done => {

            request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newProduct)
                .end((error, res) => {
                    expect(res.status).toBe(201)
                    expect(res.body.title).toEqual(newProduct.title)
                    expect(res.body.price).toEqual(newProduct.price)
                    expect(res.body.coin).toEqual(newProduct.coin)
                    expect(res.body.owner).toEqual(testUser.username)
                    done()
                })
        })

        it('should return 401 with invalid token from auth not valid', done => {

            request(app)
                .post('/products')
                .set('Authorization', `Bearer ${invalidToken}`)
                .send(newProduct)
                .end((error, res) => {
                    expect(res.status).toBe(401)
                    done()
                }) 
        })

        it('should not create a product without a title product', done => {
            request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    coin: newProduct.coin, 
                    price: newProduct.price
                })
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    done()
                })
        })

        it('should not create a product without a price', done => {
            request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: newProduct.title, 
                    coin: newProduct.coin
                })
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    done()
                })
        })

        it('should not create a product without a coin', done => {
            request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: newProduct.title, 
                    price: newProduct.price
                })
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    done()
                })
        })
    })

    describe('DELETE /products/:id', () => {

        let idSavedProduct

        beforeAll(getAuthToken)

        beforeEach(done => {
            Product.remove({}, error => {
                if(error) done(error)
                Product(productOnDatabase).save()
                    .then(product => {
                        idSavedProduct = product._id
                        done()
                    })
                    .catch(error => {
                        done(error)
                    })
            })
        })

        it('should return 400 try to get a producto with an invalid id', done => {
            request(app)
                .delete('/products/123')
                .set('Authorization', `Bearer ${authToken}`)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    done()
                })
        })

        it('Should return 400 if we try to delete a not exist product', done => {
            request(app)
                .delete(`/product/${idNotSavedProduct}`)
                .set('Authorization', `Bearer ${authToken}`)
                .end((error, res) => {
                    expect(res.status).toBe(404)
                    done()
                })
        })

        it('Should return 401 if user send a invalid token', done => {
            request(app)
                .delete(`/products/${idSavedProduct}`)
                .set('Authorization', `Bearer ${invalidToken}`)
                .end((error, res) => {
                    expect(res.status).toBe(401)
                    done()
                })
        })

        it('should return 401, if the user is not the product owner', done => {
            Product({
                title: 'Adidas SolarBoost',
                price: 95,
                coin: 'USD',
                owner: 'jon'
            }).save()
                .then(product => {
                    request(app)
                        .delete(`/products/${product._id}`)
                        .set('Authorization', `Bearer ${authToken}`)
                        .end((error, res) => {
                            expect(res.status).toBe(401)
                            expect(res.test.includes('You are not the owner')).toBe(true)
                            done()
                        })
                })
                .catch(error => {
                    done(error)
                })
        })

        it('should delete the product, the user is the owner and the token is valid', done => {
            request(app)
                .delete(`/products/${idSavedProduct}`)
                .set('Authorization', `Bearer ${authToken}`)
                .end((error, res) => {
                    expect(res.status).toBe(200)
                    expect(res.body.title).toEqual(productOnDatabase.title)
                    expect(res.body.price).toEqual(productOnDatabase.price)
                    expect(res.body.coin).toEqual(productOnDatabase.coin)
                    expect(res.body.owner).toEqual(productOnDatabase.owner)
                    Product.findById(idSavedProduct)
                        .then(product => {
                            expect(product).toBeNull()
                            done()
                        })
                        .catch(error => {
                            done(error)
                        })
                })
        })

    })

    describe('PUT /products/:id', () => {

        let idSavedProduct

        beforeAll(getAuthToken)

        beforeEach(done => {
            Product.remove({}, error => {
                if(error) done(error)
                Product(productOnDatabase).save()
                    .then(product => {
                        idSavedProduct = product._id
                        done()
                    })
                    .catch(error => {
                        done(error)
                    })
            })
        })

        it('should not update the product without a title product', done => {
            request(app)
                .put(`/products/${idSavedProduct}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    coin: newProduct.coin, 
                    price: newProduct.price
                })
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    done()
                })
        })

        it('should not update the product without a price', done => {
            request(app)
            .put(`/products/${idSavedProduct}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: newProduct.title, 
                    coin: newProduct.coin
                })
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    done()
                })
        })

        it('should not update the product without a coin', done => {
            request(app)
            .put(`/products/${idSavedProduct}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: newProduct.title, 
                    price: newProduct.price
                })
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    done()
                })
        })

        it('should update the product, the user is the owner and the token is valid', done => {
            request(app)
                .put(`/products/${idSavedProduct}`)
                .set('Authorization', `Bearer ${authToken}`)
                .end((error, res) => {
                    expect(res.status).toBe(200)
                    expect(res.body.title).toEqual(productOnDatabase.title)
                    expect(res.body.price).toEqual(productOnDatabase.price)
                    expect(res.body.coin).toEqual(productOnDatabase.coin)
                    expect(res.body.owner).toEqual(productOnDatabase.owner)
                    Product.findById(idSavedProduct)
                        .then(product => {
                            expect(product).not.toBeNull()
                            done()
                        })
                        .catch(error => {
                            done(error)
                        })
                })
        })


        it('should return 401, if the user is not the product owner', done => {
            Product({
                title: 'Adidas SolarBoost',
                price: 95,
                coin: 'USD',
                owner: 'jon'
            }).save()
                .then(product => {
                    request(app)
                        .put(`/products/${product._id}`)
                        .set('Authorization', `Bearer ${authToken}`)
                        .end((error, res) => {
                            expect(res.status).toBe(401)
                            expect(res.test.includes('You are not the owner')).toBe(true)
                            done()
                        })
                })
                .catch(error => {
                    done(error)
                })
        })

    })

})