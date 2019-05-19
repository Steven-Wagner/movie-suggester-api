const express = require('express')
const movieService = require('./movie-suggestions-service');;
const checkUserIdExists = require('../middleware/user-id-exists/check-user-id-exists');
const {requireAuth} = require('../middleware/jwt-auth');
const xss = require('xss');

const movieSuggesterRouter = express.Router();
const jsonBodyParser = express.json();

const serializeMovieSuggestions = movieSuggestion => ({
    movie_id: movieSuggestion.movie_id,
    title: xss(movieSuggestion.title),
    director: xss(movieSuggestion.director),
    img: xss(movieSuggestion.img),
    release_year: xss(movieSuggestion.release_year),
    imdb_id: xss(movieSuggestion.imdb_id),
    avg: movieSuggestion.avg
})

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
            //Only send first 100 movies
            if (movieSuggestions.length > 100) {
                moviesToReturn = movieSuggestions.slice(0,99)
                return res.status(200).json(moviesToReturn)
            }
            res.status(200).json(
                movieSuggestions.map(movieSuggestion => serializeMovieSuggestions(movieSuggestion)))
        })
        .catch(error => {
            next(error)
        })
    })

module.exports = movieSuggesterRouter
