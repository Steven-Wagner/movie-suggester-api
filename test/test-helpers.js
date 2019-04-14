const bcrypt = require('bcryptjs')

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

function makeArticlesFixtures() {
    const testUsers = makeUsersArray()
    return { testUsers }
}

function cleanTables(db) {
    return db.raw(
      `TRUNCATE
        movie_suggester_users,
        movie_suggester_follows,
        movie_suggester_movie_ratings,
        movie_suggester_movies
        RESTART IDENTITY CASCADE`
    )
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

module.exports = {
    makeUsersArray,
    cleanTables,
    seedUsers,
    newUser,
    makeFollowersArray,
    makeMoviesArray,
    seedFollowers,
    seedMovies,

    makeArticlesFixtures
}