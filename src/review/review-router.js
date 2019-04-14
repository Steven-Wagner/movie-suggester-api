const express = require('express')
const reviewService = require('./review-service')
const service = require('../util/services')
const fetch = require('node-fetch')

const reviewRouter = express.Router()
const jsonBodyParser = express.json()

reviewRouter
    .post('', jsonBodyParser, (req, res, next) => {
   
        const {title, user_id, star_rating} = req.body
        const requiredFields = {title, user_id, star_rating}
        const newReview = {user_id, star_rating}

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value == null) {
                return  res.status(400).json({
                    error: `${key} is required`
                })
            }
        }

        //Does user_id exist?
        service.checkUserId(
            req.app.get('db'),
            user_id
        )
        .then(id => {
            if(!id) {
                return res.status(400).json({
                    error: `Invalid user_id`
                })
            }

            //Check if star_rating is an int 1-5
            if (star_rating < 1 || star_rating > 5 || isNaN(star_rating)) {
                return res.status(400).json({
                    error: `Rating must be 1-5 stars`
                })
            }

            const urlFormatedTitle = title.replace(/' '/g, '+')
            fetch(`https://www.omdbapi.com/?i=${process.env.OMDB_API_KEY}&t=${urlFormatedTitle}`, {
            })
            .then(res => {
                if(!res.ok) {
                    throw new Error('Failed at www.omdbapi.com')
                }
                return res.json()
            })
            .then(movieData => {
                if(!movieData.Title) {
                    return res.status(400).json({
                        error: 'Title does not exist'
                    })
                }

                reviewService.getMovieIdByTitle(
                    req.app.get('db'),
                    title
                )
                .then(movieId => {
                    //if movie is already in Database
                    if (movieId) {
                        newReview.movie_id = movieId.id
                        reviewService.insertReview(
                            req.app.get('db'),
                            newReview
                        )
                        .then(reviewId => {
                            return res.status(201).json({review_id: reviewId})
                        })
                    }
                    else {

                        movieToInsert = {
                            title: title,
                            director: movieData.Director,
                            img: movieData.Poster,
                            release_year: movieData.Year,
                            imdb_id: movieData.imdbID
                        }
                        reviewService.insertNewMovie(
                            req.app.get('db'),
                            movieToInsert
                        )
                        .then(id => {
                            newReview.movie_id = id

                            reviewService.insertReview(
                                req.app.get('db'),
                                newReview
                            )
                            .then(reviewId => {
                                return res.status(201).json({review_id: reviewId})
                            })
                        })
                    }
                })
            })
            .catch(next)
        })
    })

    module.exports = reviewRouter