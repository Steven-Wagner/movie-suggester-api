ignoreService = {
    insertIgnore(db, movieToIgnore) {
        return db
            .into('movie_suggester_movies_to_ignore')
            .insert(movieToIgnore)
            .returning('id')
            .then(([id]) => id)
    }
}

module.exports = ignoreService