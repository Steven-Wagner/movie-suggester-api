const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const expectedSuggestedMovies = require('./expected-suggested-movies')

describe('movie-titie-suggestions Endpoints', function() {
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

    describe(`GET /api/movietitlesuggestions/:userInput`, () => {
        const testMovies = helpers.makeMoviesArray()

        beforeEach('insert movies', async function() {
            await helpers.seedMovies(
                db,
                testMovies
            )
        })

        it('GET /api/movietitlesuggestions/:userInput responds with 200 and movie title suggestions', () => {
            const userInput = 'Jaw';

            return request(app)
            .get(`/api/movietitlesuggestions/${userInput}`)
            .expect(200)
            .then(res => {
                expect(res.body[0].title).to.eql("Jaws")
            })
        })
        
        it('GET /api/movietitlesuggestions/:userInput responds with 200 and empty array when no userInput matches', () => {
            const userInput = 'z';

            return request(app)
            .get(`/api/movietitlesuggestions/${userInput}`)
            .expect(200)
            .then(res => {
                expect(res.body[0]).to.eql(undefined);
            })
        })
    })
})