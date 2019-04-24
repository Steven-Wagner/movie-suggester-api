const express = require('express')
const reviewService = require('./review-service')
const fetch = require('node-fetch')
const checkUserIdExists = require('../async-services/async-service')
const ignoreService = require('../ignore-movie/ignore-movie-service')
const {requireAuth} = require('../middleware/jwt-auth')

const reviewRouter = express.Router()
const jsonBodyParser = express.json()

reviewRouter
    .route('')
    .all(checkUserIdExists)

reviewRouter
    .route('/:user_id')
    .all(checkUserIdExists)
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
   
        const {title, user_id, star_rating} = req.body
        const requiredFields = {title, user_id, star_rating}
        const newReview = {user_id, star_rating}

        const failedValidation = reviewService.validateRequiredReviewFields(requiredFields, res)

        if (failedValidation) {
            return failedValidation
        }

        // for (const [key, value] of Object.entries(requiredFields)) {
        //     if (value == null) {
        //         return  res.status(400).json({
        //             error: `${key} is required`
        //         })
        //     }
        // }
        // //Check if star_rating is an int 1-5
        // if (star_rating < 1 || star_rating > 5 || isNaN(star_rating)) {
        //     return res.status(400).json({
        //         error: `Rating must be 1-5 stars`
        //     })
        // }

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
                    reviewService.checkDuplicateReview(
                        req.app.get('db'),
                        newReview.user_id,
                        movieId.id
                    )
                    .then(duplicateCheck => {
                        if (duplicateCheck) {

                            const duplicateBody = {
                                error: `This movie has already been reviewed`,
                                movie_id: duplicateCheck.movie_id
                            }

                            return res.status(409).json(duplicateBody)
                        }
                        else {
                            const newMovieToIgnore = {
                                user_id: newReview.user_id, 
                                movie_id : movieId.id, 
                                ignore: 'watched_it'}
                            
                            ignoreService.insertIgnore(
                                req.app.get('db'),
                                newMovieToIgnore
                            )
                            .then(ignoreId => {
                                if (isNaN(ignoreId)) {
                                    return res.status(500).json({error: 'movie was not added correctly'})
                                }
                            })

                            newReview.movie_id = movieId.id
                            reviewService.insertReview(
                                req.app.get('db'),
                                newReview
                            )
                            .then(reviewId => {
                                return res.status(201).json({review_id: reviewId})
                            })
                        }
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
                        const newMovieToIgnore = {
                            user_id: newReview.user_id, 
                            movie_id : id, 
                            ignore: 'watched_it'}
                        
                        ignoreService.insertIgnore(
                            req.app.get('db'),
                            newMovieToIgnore
                        )

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

    .patch(jsonBodyParser, (req, res, next) => {
        const {movie_id, user_id, star_rating} = req.body;
        const updatedReview = {movie_id, user_id, star_rating}

        const failedValidation = reviewService.validateRequiredReviewFields(updatedReview, res)

        if (failedValidation) {
            return failedValidation
        }
        //write test cases

        //update DB


    })
    
module.exports = reviewRouter