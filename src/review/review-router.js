const express = require('express')
const reviewService = require('./review-service')

const reviewRouter = express.Router()
const jsonBodyParser = express.json()

reviewRouter
    .post('', jsonBodyParser, (req, res, next) => {
        console.log('got to friend post')
        const {title, user_id, star_rating} = req.body
        const newReview = {title, user_id, star_rating}

        for (const [key, value] of Object.entries(newReview)) {
            if (value == null) {
                return  res.status(400).json({
                    error: `${key} is required`
                })
            }
        }
    })

    module.exports = reviewRouter