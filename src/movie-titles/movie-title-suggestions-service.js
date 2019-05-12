const reviewService = require('../review/review-service')

const movieTitleSuggestionsService = {
    getTitleSuggestions(db, userInput) {
        upperUserInput = reviewService.toTitleCase(userInput);
        return db
            .from('movie_suggester_movies')
            .select('*')
            .where('title', 'like', `%${upperUserInput}%`)
    }
}

module.exports = movieTitleSuggestionsService;