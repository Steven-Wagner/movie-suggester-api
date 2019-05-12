const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

describe('signup Endpoints', function() {
    let db

    const newUser = helpers.newUser()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('POST /api/signup', () => {
        context('signup validation', () => {

            const testUsers =  helpers.makeUsersArray()

                beforeEach('insert users', () => 
                    helpers.seedUsers(
                        db,
                        testUsers
                    )
                )

            const requiredFields = ['username', 'password']

            requiredFields.forEach(field => {
                const loginAttemptBody = {
                username: newUser.username,
                password: newUser.password,
                }

                it(`responds with 400 when '${field}' is missing`, () => {
                    delete loginAttemptBody[field]

                    return request(app)
                    .post('/api/signup')
                    .send(loginAttemptBody)
                    .expect(400, {
                        message: `${field} is required`,
                    })
                })
            })

            it.only('responds with 400 when username is already taken', () => {
                
                const duplicateUsernameUser = {
                    username: 'dunder',
                    password: 'password'
                }

                return request(app)
                .post('/api/signup')
                .send(duplicateUsernameUser)
                .expect(400, {
                    message: `username already exists`
                }
                )
            })
        })
        context('happy path', () => {
            it('responds with 201, new user_id, and new user is added to users table', () => {
                
                return request(app)
                .post('/api/signup')
                .send(newUser)
                .expect(201)
                .then(res => {
                    return db
                        .from('movie_suggester_users')
                        .select('*')
                        .where({id: res.body.user_id})
                        .first()
                        .then(row => {
                            expect(row.username).to.eql(newUser.username)
                            expect(row.first_name).to.eql(newUser.first_name)
                            expect(row.last_name).to.eql(newUser.last_name)
                            expect(row.bio).to.eql(newUser.bio)

                            return bcrypt.compare(newUser.password, row.password)
                        })
                        .then(compareMatch => {
                            return expect(compareMatch).to.be.true
                        })
                })
            })
        })
    })
})