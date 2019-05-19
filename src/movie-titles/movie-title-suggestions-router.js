const express = require('express');
const movieTitleSuggestionsService = require('./movie-title-suggestions-service');
const xss = require('xss');

const movieTitleSuggestions = express.Router();

const serializeTitleSuggestions = titleSuggestion => ({
    id: titleSuggestion.movie_id,
    title: xss(titleSuggestion.title),
    director: xss(titleSuggestion.director),
    img: xss(titleSuggestion.img),
    release_year: xss(titleSuggestion.release_year),
    imdb_id: xss(titleSuggestion.imdb_id),
    avg: titleSuggestion.avg,
    date_created: titleSuggestion.date_created
})

movieTitleSuggestions
    .route('/:userInput')
    .get((req, res, next) => {
        const userInput = req.params.userInput

            movieTitleSuggestionsService.getTitleSuggestions(
                req.app.get('db'),
                userInput)
            .then(titleSuggestions => {
                if (titleSuggestions.length > 6) {
                    const topSixSuggestions = titleSuggestions.slice(0, 6);
                    res.status(200).json(
                        topSixSuggestions.map(titleSuggestion => serializeTitleSuggestions(titleSuggestion)))
                }
                else {
                    res.status(200).json(
                        titleSuggestions.map(titleSuggestion => serializeTitleSuggestions(titleSuggestion)))
                }
            })
            .catch(error => {
                next(error)
            })
    })

module.exports = movieTitleSuggestions;