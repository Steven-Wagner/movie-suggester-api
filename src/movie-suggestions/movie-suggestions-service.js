const movieService = {
    getMovies(db, user_id) {
        return db 
            .from('movie_suggester_follows')
            .where('follower_id', user_id)
            // .whereNull('movie_suggester_movie_ratings.movies')
            // .orWhereNull('movie_suggester_movies_to_ignore.movies')
            .select(
                'movie_id AS movies', 
                'title',
                'director',
                'img',
                'release_year',
                'imdb_id')
            .avg('star_rating')
            .innerJoin('movie_suggester_movie_ratings',
            'movie_suggester_follows.follower_id',
            'movie_suggester_movie_ratings.user_id'
            )
            .innerJoin('movie_suggester_movies',
            'movie_suggester_movie_ratings.movie_id',
            'movie_suggester_movies.id')
            // .fullOuterJoin('movie_suggester_movies_to_ignore AS movies_to_ignore',
            // 'movie_suggester_follows.follower_id',
            // 'movies_to_ignore.user_id'
            // )
            .groupBy(
                'movies', 
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