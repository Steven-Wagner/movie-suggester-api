const express = require('express')
const pastReviewsService = require('./past-reviews-service')
const checkUserIdExists = require('../middleware/user-id-exists/check-user-id-exists')
const {requireAuth} = require('../middleware/jwt-auth')

const pastReviewsRouter = express.Router()

pastReviewsRouter
    .route('/:user_id')
    .all(checkUserIdExists)
    .all(requireAuth)
    .get((req, res, next) => {
        const user_id = req.params.user_id

        pastReviewsService.getUsersReviewsData(
            req.app.get('db'),
            user_id
        )
        .then(reviewData => {
            res.status(200).json({
                reviewData
            })
        })
        .catch(error => {
            next(error)
        })
    })

pastReviewsRouter
    .route('/:user_id/:review_id')
    .all(checkUserIdExists)
    .all(requireAuth)
    .delete((req, res, next) => {
        const {review_id} = req.params;

        pastReviewsService.deleteReview(
            req.app.get('db'),
            review_id
        )
        .then(deletionId => {
            if (deletionId == review_id) {
                res.status(200).json({id: deletionId})
            }
            else {
                res.status(404).json({error: {message:'ID not found. Unable to delete'}})
            }
        })
        .catch(error => {
            next(error)
        })
    })

module.exports = pastReviewsRouter