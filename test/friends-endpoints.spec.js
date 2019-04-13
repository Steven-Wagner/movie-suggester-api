const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')

describe('Friend Endpoints', function() {
    let db

    const followers = helpers.makeFollowersArray()

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

        const testUsers =  helpers.makeUsersArray()

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
                    console.log('testing')

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
})