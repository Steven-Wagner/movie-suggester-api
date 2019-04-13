// const knex = require('knex')
// const app = require('../src/app')
// const helpers = require('./test-helpers')
// const jwt = require('jsonwebtoken')

// describe('Review Endpoints', function() {
//     let db

//     // const followers = helpers.makeFollowersArray()

//     before('make knex instance', () => {
//         db = knex({
//             client: 'pg',
//             connection: process.env.TEST_DB_URL
//         })
//         app.set('db', db)
//     })

//     after('disconnect from db', () => db.destroy())

//     before('cleanup', () => helpers.cleanTables(db))

//     afterEach('cleanup', () => helpers.cleanTables(db))

//     describe('POST /api/review', () => {

//         // const testUsers =  helpers.makeUsersArray()

//         // beforeEach('insert users', () => 
//         //     helpers.seedUsers(
//         //         db,
//         //         testUsers
//         //     )
//         // )
//         // beforeEach('insert followers', () => 
//         //     helpers.seedFollowers(
//         //         db,
//         //         followers
//         //     )
//         // )

//         context('bad requests', () => {

//             const requiredFields = ['title', 'user_id', 'star_rating']

//             requiredFields.forEach(field => {
//                 const newReviewBody = {
//                     title: 'Jaws',
//                     user_id: 1,
//                     star_rating: 3
//                 }
//                 it('responds 400 when required field is missing', () => {

//                     delete newReviewBody[field]
//                     console.log('testing')

//                     return request(app)
//                     .post('/api/friend')
//                     .send(newReviewBody)
//                     .expect(400, {
//                         error: `${field} is required`
//                     })
//                 })
//             })
//         })
//     })
// })