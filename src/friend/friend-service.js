const friendService = {
    getFriend(db, follower_id, friend_id) {
        return db
            .from('movie_suggester_follows')
            .select('*')
            .where('follower_id', follower_id)
            .where('friend_id', friend_id)
            .first()
    },

    addFollow(db, newFollowing) {
        return db
            .into('movie_suggester_follows')
            .insert(newFollowing)
            .returning('*')
            .then(([newFollow]) => newFollow)
    }
}

module.exports = friendService