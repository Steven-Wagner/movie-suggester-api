const express = require('express')
const movieService = require('./movie-suggestions-service')
const checkUserIdExists = require('../middleware/user-id-exists/check-user-id-exists')
const {requireAuth} = require('../middleware/jwt-auth')

const movieSuggesterRouter = express.Router()
const jsonBodyParser = express.json()

movieSuggesterRouter
    //will eventually want to pageinate
    .route('/:user_id')
    .all(checkUserIdExists)
    .all(requireAuth)
    .get((req, res, next) => {
        movieService.getMovies(
            req.app.get('db'),
            req.params.user_id
        )
        .then(movieSuggestions => {
            let moviesToReturn;
            if (movieSuggestions.length > 100) {
                moviesToReturn = movieSuggestions.slice(0,99)
                return res.status(200).json(moviesToReturn)
            }
            res.status(200).json(movieSuggestions)
        })
        //is this how to do this?
        .catch(error => {
            next(error)
        })
    })

module.exports = movieSuggesterRouter
