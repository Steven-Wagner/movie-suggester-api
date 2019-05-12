const express = require('express')
const movieTitleSuggestionsService = require('./movie-title-suggestions-service')

const movieTitleSuggestions = express.Router()

movieTitleSuggestions
    .route('/:userInput')
    .get((req, res, next) => {
        const userInput = req.params.userInput

        // if (userInput.length > 5) {

            movieTitleSuggestionsService.getTitleSuggestions(
                req.app.get('db'),
                userInput)
            .then(titleSuggestions => {
                if (titleSuggestions.length > 6) {
                    const topTenSuggestions = titleSuggestions.slice(0, 6);
                    res.status(200).json(topTenSuggestions)
                }
                else {
                    res.status(200).json(titleSuggestions)
                }
            })
            .catch(error => {
                next(error)
            })
    })

module.exports = movieTitleSuggestions;