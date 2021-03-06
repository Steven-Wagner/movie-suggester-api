const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const expectedSuggestedMovies = require('./expected-suggested-movies')

describe('movie-suggestions Endpoints', function() {
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

    describe(`GET /api/moviesuggestions/:user_id`, () => {

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

        it('responds 400 invaild user_id', () => {
            const invalidUserId = testUsers.length+1

            return request(app)
            .get(`/api/moviesuggestions/${invalidUserId}`)
            .expect(400, {message: `Invalid user_id`})
        })
        
        it('happy path responds 200 and movie suggestions', () => {
            const testUserId = 3

            return request(app)
            .get(`/api/moviesuggestions/${testUserId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[testUserId-1]))
            .expect(200, expectedSuggestedMovies)
        })
        
        it('responds 200 and empty array when user has no friends', () => {
            const testUserId = 4

            return request(app)
            .get(`/api/moviesuggestions/${testUserId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[testUserId-1]))
            .expect(200, [])
        })
    })
})