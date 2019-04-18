require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {NODE_ENV} = require('./config');
const {CLIENT_ORIGIN} = require('./config')
const authRouter = require('./auth/auth-router')
const signUpRouter = require('./signUp/signUp-router')
const friendRouter = require('./friend/friend-router')
const reviewRouter = require('./review/review-router')
const ignoreRouter = require('./ignore-movie/ignore-movie-router')
const movieSuggestionsRouter = require('./movie-suggestions/movie-suggestions-router')

const app = express();

const morganSetting = (NODE_ENV === 'production')
    ? 'tiny'
    : 'dev';

    app.use(morgan(morganSetting));
    app.use(cors({
        origin: CLIENT_ORIGIN
    }));
    app.use(helmet());

    app.use('/api/auth', authRouter)

    app.use('/api/signup', signUpRouter)

    app.use('/api/friend', friendRouter)

    app.use('/api/review', reviewRouter)

    app.use('/api/ignore', ignoreRouter)

    app.use('/api/moviesuggestions', movieSuggestionsRouter)

    app.use(function errorHandler(error, req, res, next) {
        let response;
        console.log(error)
        if (NODE_ENV === 'production') {
            response = {error: {message: 'server error'}}
        }
        else {
            response = {error}
        }
        res.status(500).json(response)
    })

    module.exports = app;