const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
        id: 1,
        username: 'dunder', 
        first_name: 'Dunder', 
        last_name: 'Mifflin', 
        password: 'password',
        bio: 'A test bio'
        },
        {
        id: 2,
        username: 'b.deboop', 
        first_name: 'Bodeep', 
        last_name: 'Deboop', 
        password: 'password1', 
        bio: 'Another bio'
        },
        {
        id: 3,
        username: 's.smith', 
        first_name: 'Sam',
        last_name: 'Smith',
        password: 'password2', 
        bio: ''
        },
        {
        id: 4,
        username: 'lexlor',
        first_name: 'Alex',
        last_name: 'Taylor',
        password: 'password3', 
        bio: ''
        },
    ]
}

function makeFollowersArray() {
    return [
        {
        id: 1,
        follower_id: 1,
        friend_id: 2
        },
        {
        id: 2,
        follower_id: 1,
        friend_id: 3
        },
        {
        id: 3,
        follower_id: 2,
        friend_id: 4
        },
        {
        id: 4,
        follower_id: 3,
        friend_id: 1
        },
        {
        id: 5,
        follower_id: 3,
        friend_id: 2
        },

    ]
}

function makeMoviesArray() {
    return [
        {
        id: 1,
        title: 'Jaws',
        director: 'Steven Spielberg',
        img: 'https://m.media-amazon.com/images/M/MV5BMmVmODY1MzEtYTMwZC00MzNhLWFkNDMtZjAwM2EwODUxZTA5XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_SX300.jpg',
        release_year: '1975',
        imdb_id: 'tt0073195'
        },
        {
        id: 2,
        title: 'Se7en',
        director: 'David Fincher',
        img: 'https://m.media-amazon.com/images/M/MV5BOTUwODM5MTctZjczMi00OTk4LTg3NWUtNmVhMTAzNTNjYjcyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
        release_year: '1995',
        imdb_id: 'tt0114369'
        },
        {
        id: 3,
        title: 'Shrek',
        director: 'Andrew Adamson, Vicky Jenson',
        img: 'https://m.media-amazon.com/images/M/MV5BOGZhM2FhNTItODAzNi00YjA0LWEyN2UtNjJlYWQzYzU1MDg5L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
        release_year: '2001',
        imdb_id: 'tt0126029'
        },
    ]
}

function makeIgnoresArray() {
    return [
        {
        user_id: 1,
        movie_id: 1,
        ignore: 'watched_it'
        },
        {
        user_id: 2,
        movie_id: 2,
        ignore: 'not_interested'
        },
        {
        user_id: 3,
        movie_id: 3,
        ignore: 'watched_it'
        },
    ]
}

function makeRatingsArray() {
    return [
        {
        id: 1,
        user_id: 1,
        movie_id: 1,
        star_rating: 3
        },
        {
        id: 2,
        user_id: 2,
        movie_id: 1,
        star_rating: 5
        },

        {
        id: 4,
        user_id: 1,
        movie_id: 2,
        star_rating: 1
        },
        {
        id: 5,
        user_id: 2,
        movie_id: 2,
        star_rating: 5
        },
        {
        id: 6,
        user_id: 1,
        movie_id: 2,
        star_rating: 5
        },

        {
        id: 7,
        user_id: 1,
        movie_id: 3,
        star_rating: 2
        },
        {
        id: 8,
        user_id: 2,
        movie_id: 3,
        star_rating: 3
        },
        {
        id: 9,
        user_id: 3,
        movie_id: 3,
        star_rating: 4
        },
    ]
}

function seedRatings(db, ratings) {
    return db
        .into('movie_suggester_movie_ratings')
        .insert(ratings)
}

function cleanTables(db) {
    return db.raw(
      `TRUNCATE
        movie_suggester_users,
        movie_suggester_follows,
        movie_suggester_movie_ratings,
        movie_suggester_movies,
        movie_suggester_movies_to_ignore
        RESTART IDENTITY CASCADE`
    )
}

function seedIgnores(db, ignores) {
    return db
        .into('movie_suggester_movies_to_ignore')
        .insert(ignores)
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db
      .into('movie_suggester_users')
      .insert(preppedUsers)
  }

function seedFollowers(db, followers) {
    return db
        .into('movie_suggester_follows')
        .insert(followers)
}

function seedMovies(db, movies) {
    return db
        .into('movie_suggester_movies')
        .insert(movies)
}

function newUser() {
    return {
        username: 'NewTestUser', 
        first_name: 'Test', 
        last_name: 'User', 
        password: 'password',
        bio: 'A testUser bio'
        }
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({user_id: user.id}, secret, {
      subject: user.username,
      algorithm: 'HS256'
    })
    return `Bearer ${token}`
  }

module.exports = {
    makeUsersArray,
    cleanTables,
    seedUsers,
    newUser,
    makeFollowersArray,
    makeMoviesArray,
    seedFollowers,
    seedMovies,
    makeIgnoresArray,
    seedIgnores,
    makeRatingsArray,
    seedRatings,
    makeAuthHeader
}