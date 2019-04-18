const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')

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

    describe('POST /api/friend', () => {

        beforeEach('insert users', () => 
            helpers.seedUsers(
                db,
                testUsers
            )
        )
        beforeEach('insert followers', () => 
            helpers.seedFollowers(
                db,
                followers
        )
        )

        context('bad requests', () => {

            const requiredFields = ['follower_id', 'friend_id']

            requiredFields.forEach(field => {
                const newFriendRequestBody = {
                    follower_id: 1,
                    friend_id: 2
                }
                it('responds 400 when required field is missing', () => {

                    delete newFriendRequestBody[field]

                    return request(app)
                    .post('/api/friend')
                    .send(newFriendRequestBody)
                    .expect(400, {
                        error: `${field} is required`
                    })
                })
            })
            
            it('responds 400 when user tries to befriend themself', () => {

                const newFriendRequestBody = {
                    follower_id: 1,
                    friend_id: 1
                }

                return request(app)
                .post('/api/friend')
                .send(newFriendRequestBody)
                .expect(400, {
                    error: `Invalid friend_id`
                })
            })
        

            it('responds with 400 when friend_id is already a friend', () => {
                
                const alreadyFriends = followers[0]

                return request(app)
                .post('/api/friend')
                .send(alreadyFriends)
                .expect(400, {
                    error: `Already friends with ${alreadyFriends.friend_id}`
                })
            })
        })
    })
    context('happy path', () => {
        const testUsers =  helpers.makeUsersArray()

        beforeEach('insert users', () => 
            helpers.seedUsers(
                db,
                testUsers
            )
        )
        it('responds with 201 and adds follow to database', () => {

            const newFollow = {
                follower_id: 1,
                friend_id: 4
            }

            return request(app)
            .post('/api/friend')
            .send(newFollow)
            .expect(201)
            .expect(res => {
                expect(res.body.id).to.eql(1)
                expect(res.body.follower_id).to.eql(1)
                expect(res.body.friend_id).to.eql(4)

                db
                    .from('movie_suggester_follows')
                    .where('id', res.body.id)
                    .first()
                    .then(dbFollow => {
                        expect(dbFollow.follower_id).to.eql(1)
                        expect(dbFollow.friend_id).to.eql(4)
                    })
            })
        })
    })
    describe(`GET /api/friend/suggestions`, () => {

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
        
        it('happy path responds 200 and friend suggestions', () => {
            const testUserId = 2

            return request(app)
            .get(`/api/friend/suggestions/${testUserId}`)
            .expect(200, { '1': 2, '3': 1 })
        })
    })
})