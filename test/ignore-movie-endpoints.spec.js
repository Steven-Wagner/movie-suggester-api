const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Review Endpoints', function() {
    let db

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

    const testUsers =  helpers.makeUsersArray()
    const testMovies = helpers.makeMoviesArray()

    beforeEach('insert users', async function() { 
        await helpers.seedUsers(
            db,
            testUsers
        )
    })
    
    beforeEach('insert users', async function() { 
        await helpers.seedMovies(
            db,
            testMovies
        )
    })


    describe('POST /api/ignore', () => {
        context(`Fields are invalid`, () => {
            
            const requiredFields = ['ignore','user_id', 'movie_id']

            requiredFields.forEach(field => {
                const newIgnoreBody = {
                    user_id: 1,
                    movie_id: testMovies[0],
                    ignore: 'watched_it'
                }

                it(`responds 400 when required ${field} is missing`, () => {

                    delete newIgnoreBody[field]

                    return request(app)
                    .post(`/api/ignore/1`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newIgnoreBody)
                    .expect(400, {
                        message: `${field} is required`
                    })
                })
            })

            const invalidFields = ['wrong_thing', testUsers.length+1, testMovies.length+1]

            requiredFields.forEach((field, i) => {
                
                const newIgnoreBody = {
                    ignore: i===0 ? invalidFields[i] : 'watched_it',
                    user_id: i===1 ? invalidFields[i] : testUsers.length,
                    movie_id: i===2 ? invalidFields[i] : testMovies.length,
                }

                it(`responds 400 when ${field} is invalid`, () => {

                    return request(app)
                    .post(`/api/ignore/1`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newIgnoreBody)
                    .expect(400, {
                        message: `Invalid ${field}`
                    })
                })
            })
        })

        context(`happy path`, () => {

            const testIgnores = helpers.makeIgnoresArray()

            beforeEach('add ignores', async function() {
                await helpers.seedIgnores(db, testIgnores)
            })

            const happyIgnoreBody = {
                user_id: testUsers.length,
                movie_id: testMovies.length,
                ignore: 'watched_it'
            }

            it(`Responds 201 with ignore id`, () => {
                
                return request(app)
                .post(`/api/ignore/${happyIgnoreBody.user_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[happyIgnoreBody.user_id-1]))
                .send(happyIgnoreBody)
                .expect(201, {
                    id: testIgnores.length+1
                })
            })
            
            it(`Responds 201 and ignore data is added to database`, () => {
                
                return request(app)
                .post(`/api/ignore/${happyIgnoreBody.user_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[happyIgnoreBody.user_id-1]))
                .send(happyIgnoreBody)
                .expect(201)
                .then(newIgnore => {
                    newIgnoreId = newIgnore.body.id
                    return db
                        .from('movie_suggester_movies_to_ignore')
                        .select('*')
                        .where('id', newIgnoreId)
                        .first()
                        .then(ignoreDB => {
                            expect(ignoreDB.user_id).to.eql(happyIgnoreBody.user_id)
                            expect(ignoreDB.movie_id).to.eql(happyIgnoreBody.movie_id)
                            expect(ignoreDB.ignore).to.eql(happyIgnoreBody.ignore)
                        })
                })
            })
        })
    })
})