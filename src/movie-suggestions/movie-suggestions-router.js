const express = require('express')
const movieService = require('./movie-suggestions-service')
const checkUserIdExists = require('../async-services/async-service')
const {requireAuth} = require('../middleware/jwt-auth')

const movieSuggesterRouter = express.Router()
const jsonBodyParser = express.json()

movieSuggesterRouter
    //will eventually want to pageinate
    .route('/:user_id')
    .all(checkUserIdExists)
    .all(requireAuth)
    .get((req, res) => {
        movieService.getMovies(
            req.app.get('db'),
            req.params.user_id
        )
        .then(movieSuggestions => {
            let moviesToReturn;
            console.log('movie suggestions', movieSuggestions.length)
            if (movieSuggestions.length > 100) {
                moviesToReturn = movieSuggestions.slice(0,99)
                return res.status(200).json(moviesToReturn)
            }
            res.status(200).json(movieSuggestions)
        })
    })

module.exports = movieSuggesterRouter
