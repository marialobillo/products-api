const { TestScheduler } = require('jest');
let request = require('supertest');
let User = require('./users.model');
let app = require('../../../index').app;
let server = require('../../../index').server;

describe('** Users **', () => {

    beforeEach((done) => {
        User.remove({}, (error) => {
            done()
        })
    })

    afterAll(() => {
        server.close()
    })

    describe('GET /products', () => {

        test('If there is not Users, should returns an empty array', (done) => {
            request(app)
                .get('/users')
                .end((error, res) => {
                    expect(res.status).toBe(200)
                    expect(res.body).toBeInstanceOf(Array)
                    expect(res.body).toHaveLength(0)
                    done()
                })
        })
    })
})