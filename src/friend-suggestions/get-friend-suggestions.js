function getFriendSuggestions(db, user_id) {
    return db 
        .select(
            'other_rating.user_id as user_id',
            'user_data.bio',
            'user_data.username'
        )
        .count('other_rating.id as match_score')
        .from(
            'movie_suggester_movie_ratings as other_rating'
        )
        .innerJoin(
            'movie_suggester_users as user_data',
            'other_rating.user_id',
            'user_data.id'
        )
        .whereIn(
            'other_rating.user_id', function() {
                this.select('rating.user_id as user_id')
                .from(
                    'movie_suggester_movie_ratings as rating',
                    'movie_suggester_movies as movie'
                )
                .whereNot('rating.user_id', user_id)
                .whereNotIn('rating.user_id', function() {
                    this.select('follows.friend_id')
                    .from(
                        'movie_suggester_follows as follows'
                    )
                    .where(
                        'follows.follower_id', user_id
                    )
                })
                .whereIn('other_rating.movie_id', function() {
                    this.select(
                        'my_rating.movie_id as my_movie_id'
                    )
                    .from(
                        'movie_suggester_movie_ratings as my_rating'
                    )
                    .where(
                        'my_rating.user_id', user_id
                    )
                    .where(db.raw(
                        'my_rating.star_rating between other_rating.star_rating-1 and other_rating.star_rating+1'
                    ))
                })
            }
        )
        .groupBy(
            'other_rating.user_id',
            'user_data.bio',
            'user_data.username'
        )
        .orderBy(
            'match_score', 'desc'
        )
}

module.exports = getFriendSuggestions