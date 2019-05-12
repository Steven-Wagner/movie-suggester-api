const express = require('express');
const friendService = require('./friend-service');
const checkUserIdExists = require('../middleware/user-id-exists/check-user-id-exists');
const getFriendSuggestions = require('../friend-suggestions/get-friend-suggestions');
const {requireAuth} = require('../middleware/jwt-auth');

const friendRouter = express.Router()
const jsonBodyParser = express.json()

friendRouter
    .route('/:user_id')
    .all(checkUserIdExists)
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        
        const {follower_id, friend_id} = req.body
        const newFollowing = {follower_id, friend_id}

        for (const [key, value] of Object.entries(newFollowing)) {
            if (value == null) {
                return  res.status(400).json({
                    message: `${key} is required`
                })
            }
        }

        if (follower_id === friend_id) {
            return res.status(400).json({
                message: `Invalid friend_id`
            })
        }

        friendService.getFriend(
            req.app.get('db'),
            follower_id, 
            friend_id
        )
        .then(alreadyFriends => {
            
            if (alreadyFriends) {
                return res.status(400).json({
                    message: `Already friends with ${alreadyFriends.friend_id}`
                })
            }

            //add to database
            friendService.addFollow(
                req.app.get('db'),
                newFollowing
            )
            .then(newFollow => {
                return res.status(201).json(newFollow)
            })
        })
        .catch(next)
    })

friendRouter
    .route('/suggestions/:user_id')
    .all(checkUserIdExists)
    .all(requireAuth)
    .get((req, res) => {
        getFriendSuggestions(
            req.app.get('db'),
            req.params.user_id)
        .then(friendSuggestions => {
            return res.status(200).json(friendSuggestions)
        })
    })



module.exports = friendRouter