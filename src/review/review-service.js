reviewService = {
    getMovieIdByTitle(db, title) {
        return db
            .from('movie_suggester_movies')
            .select('id')
            .where('title', title)
            .first()
    },

    insertNewMovie(db, newMovieData) {
        return db
            .into('movie_suggester_movies')
            .insert(newMovieData)
            .returning('id')
            .then(([id]) => id)
    },

    insertReview(db, newReview) {
        return db
            .into('movie_suggester_movie_ratings')
            .insert(newReview)
            .returning('id')
            .then(([id]) => id)
    },
    checkDuplicateReview(db, userId, movieId) {
        return db
            .from('movie_suggester_movie_ratings')
            .select('movie_id')
            .where('user_id', userId)
            .where('movie_id', movieId)
            .first()
    },
    validateRequiredReviewFields(requiredFields, res) {
        const star_rating = requiredFields.star_rating
        for (const [key, value] of Object.entries(requiredFields)) {
            if (value == null) {
                return res.status(400).json({
                    error: `${key} is required`
                })
            }
        }
        //Check if star_rating is an int 1-5
        if (star_rating < 1 || star_rating > 5 || isNaN(star_rating)) {
            return res.status(400).json({
                error: `Rating must be 1-5 stars`
            })
        }
        console.log('done validate')
    }
}

module.exports = reviewService