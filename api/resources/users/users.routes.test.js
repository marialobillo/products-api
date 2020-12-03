const { TestScheduler } = require('jest');
let request = require('supertest');
let User = require('./users.model');
let app = require('../../../index').app;
let server = require('../../../index').server;

let dummyUsers = [
    {
        username: 'Peter',
        email: 'peter@mail.com',
        password: 'hello123'
    },
    {
        username: 'Jon',
        email: 'jon@mail.com',
        password: 'hello123'
    },
    {
        username: 'Kim',
        email: 'kim@mail.com',
        password: 'hello123'
    }
];
describe('** Users **', () => {

    beforeEach((done) => {
        User.remove({}, (error) => {
            done()
        })
    })

    afterAll(() => {
        server.close()
    })

    describe('GET /users', () => {

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

        test('If there is Users, should return them on an array', (done) => {
            Promise.all(dummyUsers.map(user => (new User(user)).save()))
                .then(users => {
                    request(app)
                        .get('/users')
                        .end((error, res) => {
                            expect(res.status).toBe(200)
                            expect(res.body).toBeInstanceOf(Array)
                            expect(res.body).toHaveLength(3)
                            done()
                        })
                })
        })
    })
})