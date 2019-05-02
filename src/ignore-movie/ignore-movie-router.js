const express = require('express')
const ignoreService = require('./ignore-movie-service')
const service = require('../util/services')
const {requireAuth} = require('../middleware/jwt-auth')

const ignoreRouter = express.Router()
const jsonBodyParser = express.json()

ignoreRouter
    .route('/:user_id')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
   
        const {user_id, movie_id, ignore} = req.body
        const newMovieToIgnore = {user_id, movie_id, ignore}

        for (const [key, value] of Object.entries(newMovieToIgnore)) {
            if (value == null) {
                return  res.status(400).json({
                    message: `${key} is required`
                })
            }
        }

        //is ignore valid?
        if (ignore !== 'watched_it' && ignore !== 'not_interested') {
            return res.status(400).json({
                message: `Invalid ignore`
            })
        }

        //Does user_id exist?
        service.checkUserId(
            req.app.get('db'),
            user_id
        )
        .then(id => {
            if(!id) {
                return res.status(400).json({
                    message: `Invalid user_id`
                })
            }
            //does movie exist?
            service.checkMovieId(
                req.app.get('db'),
                movie_id
            )
            .then(id => {
                if(!id) {
                    return res.status(400).json({
                        message: `Invalid movie_id`
                    })
                }

                //add newIgnore to database
                ignoreService.insertIgnore(
                    req.app.get('db'),
                    newMovieToIgnore
                )
                .then(id => {
                    return res.status(201).json({id: id})
                })
            })
        })
    })

module.exports = ignoreRouter