//Questions:
//This works but:
//  1. Is there a way I could do more of this using sql?
//  2. Will this proccess take too long if a user has lots of reviews and there are lots of friends? How can make this more scalable?

function getFriendSuggestions(db, user_id) {
    let suggestedFriendsUserIdsAndMatchScore = {};
    //Get a list of reviews the current user has submitted
    return db
        .from('movie_suggester_movie_ratings')
        .select('*')
        .where('user_id', user_id)
        .then(usersReviews => {

            //iterate through the current user's reviews and find users that have reviwed the same movie similary
            return Promise.all(usersReviews.map(review => getMatchingFriends(db, user_id, review))
            ).then((listOfAllMatchingUsers) => {

                //add up each time the current user's reviews matched another user's review and return an object
                //with {user_id: numOfTimesReviewsMatched, ...} 
                listOfAllMatchingUsers.forEach(matchingUsers => {
                    matchingUsers.forEach(user_id_Object => {
                        
                        const user_id = user_id_Object.user_id
                        
                        if (suggestedFriendsUserIdsAndMatchScore[user_id] === undefined) {
                            suggestedFriendsUserIdsAndMatchScore[user_id] =  1
                        }
                        else{
                        suggestedFriendsUserIdsAndMatchScore[user_id] += 1
                        }
                    })
                })
                return suggestedFriendsUserIdsAndMatchScore
            })
        })
}        

function getMatchingFriends(db, user_id, review) {
    return db
        .from('movie_suggester_movie_ratings')
        .select('user_id')
        .where('movie_id', review.movie_id)
        .whereBetween('star_rating', [review.star_rating-1, review.star_rating+1])
        .whereNot('user_id', user_id)
}

module.exports = getFriendSuggestions

//get reviews of user

//find similar reviews by other users

//count number of similar reviews by user

//sort by highest count