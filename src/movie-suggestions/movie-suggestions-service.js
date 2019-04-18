const movieService = {
    getMovies(db, user_id) {
        return db 
            .from('movie_suggester_follows')
            .where('follower_id', user_id)
            .select(
                'movie_id', 
                'title',
                'director',
                'img',
                'release_year',
                'imdb_id')
            .avg('star_rating')
            //.as('avg_star_rating') Can't figure out how to use .as()
            .innerJoin('movie_suggester_movie_ratings',
            'movie_suggester_follows.friend_id',
            'movie_suggester_movie_ratings.user_id'
            )
            .innerJoin('movie_suggester_movies',
            'movie_suggester_movie_ratings.movie_id',
            'movie_suggester_movies.id')
            .groupBy(
                'movie_id', 
                'title',
                'director',
                'img',
                'release_year',
                'imdb_id'
            )
            .orderBy('avg', 'desc')
            .then(movieSuggestions=> {
                return movieSuggestions
            })
    }
}

module.exports = movieService