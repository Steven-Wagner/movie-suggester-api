const pastReviewsService = {
    getUsersReviewsData(db, user_id) {
        return db
            .from('movie_suggester_movie_ratings as ratings')
            .select('ratings.id as review_id', 'movie_id', 'star_rating', 'title', 'director', 'img', 'release_year', 'imdb_id')
            .where('user_id', user_id)
            .innerJoin('movie_suggester_movies as movies', 'ratings.movie_id', 'movies.id')
    },
    deleteReview(db, review_id) {
        return db
            .from('movie_suggester_movie_ratings')
            .select('id')
            .where('id', review_id)
            .del()
            .returning('id')
            .then(([id]) => id)
    }
}

module.exports = pastReviewsService;