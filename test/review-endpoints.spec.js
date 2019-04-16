const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const fetch = require('node-fetch')

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

    describe('POST /api/review', () => {

        const testUsers =  helpers.makeUsersArray()

        beforeEach('insert users', async function() { 
            await helpers.seedUsers(
                db,
                testUsers
            )
        }
        )

        context('bad requests', () => {

            const requiredFields = ['title', 'user_id', 'star_rating']

            requiredFields.forEach(field => {
                const newReviewBody = {
                    title: 'Jaws',
                    user_id: 1,
                    star_rating: 3
                }
                it(`responds 400 when required ${field} is missing`, () => {

                    delete newReviewBody[field]

                    return request(app)
                    .post(`/api/review/${newReviewBody.user_id}`)
                    .send(newReviewBody)
                    .expect(400, {
                        error: `${field} is required`
                    })
                })
            })

            it(`responds with 400 when user_id is invalid`, () => {
                const badUserId = {
                    title: 'Jaws',
                    user_id: testUsers.length+1,
                    star_rating: 3
                }

                return request(app)
                    .post(`/api/review/${badUserId.user_id}`)
                    .send(badUserId)
                    .expect(400, {
                        error: `Invalid user_id`
                })
            })
            
            context(`responds with 400 when star_rating is invalid`, () => {
                const badRatings = [0, 6, '100', 'a']
                
                badRatings.forEach(rating => {
                    const badUserId = {
                        title: 'Jaws',
                        user_id: 1,
                        star_rating: rating
                    }

                    it(`responds 400 when star_rating is ${rating}`, () => {

                        return request(app)
                            .post(`/api/review/${badUserId.user_id}`)
                            .send(badUserId)
                            .expect(400, {
                                error: `Rating must be 1-5 stars`
                        })
                    })
                })
            })
            it(`responds with 400 when title does not exists in omdbapi.com`, () => {
                const badTitle = {
                    title: 'Jawwwwws',
                    user_id: 1,
                    star_rating: 3
                }

                return request(app)
                    .post(`/api/review/${badTitle.user_id}`)
                    .send(badTitle)
                    .expect(400, {
                        error: 'Title does not exist'
                })
            })
        })

        describe(`POST a review of a movie that is not in the database`, () => {
            const newMovie = {
                title: 'Jaws',
                user_id: 1,
                star_rating: 3
            }

            it(`movie is added to database`, () => {

                const expectedResult = {
                    title: "Jaws",
                    director: "Steven Spielberg",
                    img: "https://m.media-amazon.com/images/M/MV5BMmVmODY1MzEtYTMwZC00MzNhLWFkNDMtZjAwM2EwODUxZTA5XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_SX300.jpg",
                    release_year: 1975,
                    imdb_id: "tt0073195",
                    id: 1,
                }

                return request(app)
                    .post(`/api/review/${newMovie.user_id}`)
                    .send(newMovie)
                    .then(() => {
                        return db
                            .from('movie_suggester_movies')
                            .select('*')
                            .where('title', newMovie.title)
                            .first()
                            .then(newMovieDB => {
                                expectedResult.date_created = newMovieDB.date_created
                                expect(newMovieDB).to.eql(expectedResult)
                            })
                        
                    }) 
            })
            
            it(`Movie review is added to ratings table`, () => {
                return request(app)
                .post(`/api/review/${newMovie.user_id}`)
                .send(newMovie)
                .expect(201)
                .then(res => {
                    expect(res.body.review_id).to.eql(1)
                    return db 
                        .from('movie_suggester_movie_ratings')
                        .where('id', 1)
                        .select('*')
                        .first()
                        .then(reviewData => {
                            expect(reviewData.user_id).to.eql(newMovie.user_id)
                            expect(reviewData.star_rating).to.eql(newMovie.star_rating)
                            expect(reviewData.movie_id).to.eql(res.body.review_id)
                        })
                })
            })
        })

        describe(`POST a review of a movie that is already in the database`, () => {
            
            const testMovies = helpers.makeMoviesArray()
            
            beforeEach(`Add movies to database`, async function() {
                await helpers.seedMovies(
                    db,
                    testMovies
                )
            })

            const ratingOfMovieInDB = {
                title: 'Jaws',
                user_id: 1,
                star_rating: 3
            }

            it(`Movie review is added to ratings table`, () => {

                return request(app)
                .post(`/api/review/${ratingOfMovieInDB.user_id}`)
                .send(ratingOfMovieInDB)
                .expect(201)
                .then(res => {
                    expect(res.body.review_id).to.eql(1)
                    return db 
                        .from('movie_suggester_movie_ratings')
                        .where('id', 1)
                        .select('*')
                        .first()
                        .then(reviewData => {
                            expect(reviewData.user_id).to.eql(ratingOfMovieInDB.user_id)
                            expect(reviewData.star_rating).to.eql(ratingOfMovieInDB.star_rating)
                            expect(reviewData.movie_id).to.eql(res.body.review_id)
                        })
                })
            })

            it(`There are no duplicate titles in movie table`, () => {
                return request(app)
                .post(`/api/review/${ratingOfMovieInDB.user_id}`)
                .send(ratingOfMovieInDB)
                .expect(201)
                .then(() => {
                    return db 
                        .from('movie_suggester_movies')
                        .where('title', ratingOfMovieInDB.title)
                        .select('*')
                        .then(movieCheck => {
                            expect(movieCheck).to.have.length(1)
                        })
                })
            })
        })

        describe('omdbapi.com tests', () => {
            it('fetch request from omdbapi.com is working', () => {
                const selectedExpectedResponse = {
                    Title: "Se7en",
                    Year: "1995",
                }

                fetch(`https://www.omdbapi.com/?i=${process.env.OMDB_API_KEY}&t=Se7en`, {
                })
                .then(res => {
                    return res.json()
                })
                .then(movieData => {
                    expect(movieData.Title).to.eql(selectedExpectedResponse.Title)
                    expect(movieData.Year).to.eql(selectedExpectedResponse.Year)
                })
            })
        })
    })
})