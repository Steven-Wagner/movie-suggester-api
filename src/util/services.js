
service = {
    checkUserId(db, user_id) {
        return db
            .from('movie_suggester_users')
            .select('id')
            .where('id', user_id)
            .first()
    },
    
    checkMovieId(db, movie_id) {
        return db
            .from('movie_suggester_movies')
            .select('id')
            .where('id', movie_id)
            .first()
    },
}

module.exports = service