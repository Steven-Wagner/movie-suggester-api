const express = require('express')
const reviewService = require('./review-service')
const fetch = require('node-fetch')
const checkUserIdExists = require('../middleware/user-id-exists/check-user-id-exists')
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

        const urlTitle = reviewService.toTitleCase(title)

        const urlFormatedTitle = urlTitle.replace(/' '/g, '+')
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
                    message: 'Title does not exist'
                })
            }
            if (movieData.Title !== urlTitle) {
                return res.status(400).json({
                    message: 'Title does not exist'
                })
            }

            reviewService.getMovieIdByTitle(
                req.app.get('db'),
                movieData.Title
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
                                message: `This movie has already been reviewed`,
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
                                    return res.status(500).json({message: 'movie was not added correctly'})
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
                        title: movieData.Title,
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
                    .catch(next)
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

        reviewService.getMovieById(
            req.app.get('db'),
            movie_id)
        .then(movie_idCheck => {
            if (!movie_idCheck) {
                return res.status(400).json({message: `movie_id is not in database`})
            }

            reviewService.updateReview(
                req.app.get('db'),
                updatedReview
            )
            .then(updateResMovieId => {
                res.status(200).json({review_id: updateResMovieId})
            })
        })
        .catch(error => {
            next(error)
        })



    })
    
module.exports = reviewRouter