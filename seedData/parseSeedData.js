const fs = require('fs');
// const {PORT, DB_URL} = require('../src/config')
const knex = require('knex')
require('dotenv').config()
const fetch = require('node-fetch')
const DB_URL = "postgres://yheuzsxbeumids:193da686b6fef28e6c554eb487db146847c080def4c99fc0876e1f7159439cb2@ec2-54-243-197-120.compute-1.amazonaws.com:5432/d160gastor6qgq"
var pg = require('pg');
pg.defaults.ssl = true;

const db = knex({
    client: 'pg',
    connection: DB_URL
})

console.log(DB_URL)

const numOfReviewsToSeed = 1500;

fs.readFile('./seedData/ml-latest-small/ratings.csv', 'utf-8', (err, data) => {
    if (err) throw err;

    const ratings = data.split('\r\n');

    const mappedRatings = ratings.map(rating => {
        return rating.split(',')
    })

    mappedRatings.shift()

    const userData = [];
    const movieIds = [];
    const reviewsData = [];

    for (let i=0; i < numOfReviewsToSeed; i++) {
        const user_id = mappedRatings[i][0];
        const movie_id = mappedRatings[i][1];
        const star_rating = mappedRatings[i][2];
        const randomName = `${getRandomName()}${user_id}`

        reviewsData.push({
            user_id: user_id,
            movie_id: movie_id,
            star_rating: star_rating
        })

        if (!userData[user_id-1]) {
            userData[user_id-1] = {
                id: user_id,
                first_name: user_id,
                last_name: user_id,
                bio: '',
                password: 'password',
                username: randomName
            }
        }

        if (!movieIds[movie_id-1]) {
            movieIds[movie_id-1] = {
                id: movie_id,
            }
        }
    }

    const userDataFiltered = userData.filter(users => {
        return users !== undefined;
    })
    const movieIdsFiltered = movieIds.filter(movies => {
        return movies !== undefined;
    })

    clearTables()
    .then(() => {
        return insertUser(userDataFiltered)
    })
    .then(() => {

        fs.readFile('./seedData/ml-latest-small/movies.csv', 'utf-8', (err, data) => {
            if (err) throw err;
        
            const movies = data.split('\r\n');
        
            const mappedMovies = movies.map(movie => {
                return movie.split(',')
            })

            mappedMovies.shift()

            const addMoviePromise = new Promise(function(resolve, reject){
                getMovieData(movieIdsFiltered, mappedMovies, resolve)
            })
            addMoviePromise
            .then(() => {
                addReviews(reviewsData)
            })
        })
    })
  });

function addReviews(reviewsData) {
    const reviewsToAddPromises = [];
    const reviewsToAdd = [];
    
    reviewsData.forEach(review => {
        reviewsToAddPromises.push(
            checkMovieIdExists(review.movie_id)
            .then(movieExists => {
                if (movieExists) {
                    review.star_rating = Math.round(parseFloat(review.star_rating))
                    reviewsToAdd.push(review)
                }
            })
        )
    })
    Promise.all(reviewsToAddPromises)
    .then(() => {
        insertReviews(reviewsToAdd)
        .then(res => {
            console.log('ids of reviews', res)
        })
        .then(() => {
            db.raw(`SELECT setval('movie_suggester_users_id_seq', 100);`)
            .then(res => {
                db.raw(`SELECT nextval('movie_suggester_users_id_seq')`)
            })
            db.raw(`SELECT setval('movie_suggester_movies_id_seq', 50000);`)
            .then(res => {
                db.raw(`SELECT nextval('movie_suggester_movies_id_seq')`)
            })
            
            console.log('finished')
        })
    })
}

function insertReviews(reviewsToAdd) {
    return db
    .into('movie_suggester_movie_ratings')
    .insert(reviewsToAdd)
    .returning('id')
}

function checkMovieIdExists(movie_id) {
    return db
        .from('movie_suggester_movies')
        .where('id', movie_id)
        .select('id')
        .first()
}

function getMovieData(movieIdsFiltered, mappedMovies, resolve) {

    const movieData = [];
    const badMovieTitles = [];
    const OMDBFetches = [];

    movieIdsFiltered.forEach(movie => {
        const movieIdToGet = movie.id

        const currentTitleData = mappedMovies.find(movie => {
            return movie[0] === movieIdToGet
        })

        currentTitle = currentTitleData[1].slice(0, -6)

         if (currentTitle[0] !== `"`) {
            const urlFormatedTitle = currentTitle.replace(/' '/g, '+')

            OMDBFetches.push(
                fetch(`https://www.omdbapi.com/?i=${process.env.OMDB_API_KEY}&t=${urlFormatedTitle}`, {
                })
                .then(res => {
                    if(res.Error) {
                        throw new Error(`${res.Error} with ${currentTitle}`)
                    }
                    return res.json()
                })
                .then(OMDBData => {
                    if (!OMDBData.Title) {
                        badMovieTitles.push(currentTitle)
                    }
                    else {
                        movieToInsert = {
                            id: movieIdToGet,
                            title: OMDBData.Title,
                            director: OMDBData.Director,
                            img: OMDBData.Poster,
                            release_year: OMDBData.Year,
                            imdb_id: OMDBData.imdbID
                        }

                        movieData.push(movieToInsert)
                    }
                })
                .catch(error => {
                    console.log(error)
                })
            )
        }
    })
    Promise.all(OMDBFetches)
    .then(() => {
        insertMovies(movieData)
        .then(resIds => {
            resolve('finished')
        })
    })
}

function insertMovies(movieData) {
    return db
        .into('movie_suggester_movies')
        .insert(movieData)
        .returning('id')
}

function getRandomName() {
    const names = ['Steve','Lydia', 'Matt', 'Matthew', 'Joe', 'David', 'Sam', 'Juan', 'Samsom', 'George', 'Marty', 'McFly', 'The Devil']

    return names[Math.floor(Math.random()*names.length)];
}

function insertUser(userDataFilters) {
    return db
        .into('movie_suggester_users')
        .insert(userDataFilters)
        .returning('id')
}

function clearTables() {
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