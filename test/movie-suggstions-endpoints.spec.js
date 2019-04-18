const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const expectedSuggestedMovies = require('./expected-suggested-movies')

describe('Friend Endpoints', function() {
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

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /api/friend/suggestions/:user_id`, () => {

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
            .get(`/api/friend/suggestions/${invalidUserId}`)
            .expect(400, {error: `Invalid user_id`})
        })
        
        it('happy path responds 200 and movie suggestions', () => {
            const testUserId = 3

            return request(app)
            .get(`/api/moviesuggestions/${testUserId}`)
            .expect(200, expectedSuggestedMovies)
        })
        
        it('responds 200 and empty array when user has no friends', () => {
            const testUserId = 4

            return request(app)
            .get(`/api/moviesuggestions/${testUserId}`)
            .expect(200, [])
        })
    })
})