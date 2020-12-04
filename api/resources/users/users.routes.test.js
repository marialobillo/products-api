const { TestScheduler } = require('jest');
let request = require('supertest');
let bcrypt = require('bcrypt');
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

function userValidExist(user, done){
    User.find({ username: user.username})
        .then(users => {
            expect(users).toBeInstanceOf(Array);
            expect(users).toHaveLength(1)
            expect(users[0].username).toEqual(user.username)
            expect(users[0].email).toEqual(user.email)

            let equals = bcrypt.compareSync(user.password, users[0].password)
            expect(equals).toBeTruthy()
            done()
        })
        .catch(error => {
            done(error)
        })
}

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

describe('POST /users', () => {

    xtest('Should create an user if is valid', (done) => {
        request(app)
            .post('/users')
            .send(dummyUsers[0])
            .end((error, res) => {
                console.log('status', res.body)

                expect(res.status).toBe(201)
                
                expect(typeof res.text).toBe('string')
                expect(res.text).toEqual('User create successfully')
                userValidExist(dummyUsers[0], done)
            })
    })

    test('Should fail try to register an already username registered', (done) => {
        Promise.all(dummyUsers.map(user => (new User(user)).save()))
            .then(users => {
                request(app)
                    .post('/users')
                    .send({
                        username: 'Peter',
                        email: 'newpeter@mail.com',
                        password: 'hello123'
                    })
                    .end((error, res) => {
                        expect(res.status).toBe(409)
                        expect(typeof res.text).toBe('string')
                        done()
                    })
            })
    })

    test('Should fail try to register an already email registered', (done) => {
        Promise.all(dummyUsers.map(user => (new User(user)).save()))
            .then(users => {
                request(app)
                    .post('/users')
                    .send({
                        username: 'New Peter',
                        email: 'jon@mail.com',
                        password: 'hello123'
                    })
                    .end((error, res) => {
                        expect(res.status).toBe(409)
                        expect(typeof res.text).toBe('string')
                        done()
                    })
            })
    })

    test('Shoul not create a user without username', (done) => {
        request(app)
            .post('/users')
            .send({
                email: 'daniel@mail.com',
                password: 'hello123'
            })
            .end((error, res) => {
                expect(res.status).toBe(400)
                expect(typeof res.text).toBe('string')
                done()
            })
    })

    test('Should not create an user without password', () => {
        request(app)
        .post('/users')
        .send({
            username: 'Daniel',
            email: 'daniel@mail.com',
        })
        .end((error, res) => {
            expect(res.status).toBe(400)
            expect(typeof res.text).toBe('string')
            done()
        })
    })

    test('Should not create an user without email', () => {
        request(app)
        .post('/users')
        .send({
            username: 'Daniel',
            password: 'hello123'
        })
        .end((error, res) => {
            expect(res.status).toBe(400)
            expect(typeof res.text).toBe('string')
            done()
        })
    })

})