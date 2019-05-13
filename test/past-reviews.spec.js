const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('pastreviews Endpoints', function() {
    let db

    const followers = helpers.makeFollowersArray()
    const testUsers =  helpers.makeUsersArray()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', async function() {
        await db.destroy()
    })

    before('cleanup', async function() {
        await helpers.cleanTables(db)
    })

    afterEach('cleanup', async function() {
        await helpers.cleanTables(db)
    })

    context(`happy paths`, () => {

        beforeEach('insert users', async function() { 
            await helpers.seedUsers(
                db,
                testUsers
            )
        }
        )

        beforeEach('insert followers', async function() {
            await helpers.seedFollowers(
                db,
                followers
            )
        }
        )

        const testRatings = helpers.makeRatingsArray()
        const testMovies = helpers.makeMoviesArray()

        beforeEach('insert movies', async function() {
            await helpers.seedMovies(
                db,
                testMovies
            )
        }
        )
        
        beforeEach('insert ratings', async function() {
            await helpers.seedRatings(
                db,
                testRatings
            )
        }
        )
        describe(`DELETE /api/pastreviews/:user_id/:review_id`, () =>{
            it(`responds 200 and with the id of the deleted review`, () => {
                const userId = testUsers[0].id
                const reviewId = testRatings[0].id
            
                return request(app)
                    .delete(`/api/pastreviews/${userId}/${reviewId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .then(res => {
                        return db
                            .from('movie_suggester_movie_ratings')
                            .select('id')
                            .where('id', reviewId)
                            .then(idRes => {
                                expect(idRes[0]).to.eql(undefined)
                            })
                    })
            })
        })

        describe(`GET /api/pastreviews/:user_id`, () => {
    
            it(`responds 200 and with a list of past reviewed movies by the user`, () => {
    
                const userId = testUsers[0].id
    
                return request(app)
                .get(`/api/pastreviews/${userId}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
            })
        })
    })
})

    