const express = require('express')
const friendService = require('./friend-service')

const friendRouter = express.Router()
const jsonBodyParser = express.json()

friendRouter
    .post('', jsonBodyParser, (req, res, next) => {
        console.log('got to friend post')
        const {follower_id, friend_id} = req.body
        const newFollowing = {follower_id, friend_id}

        for (const [key, value] of Object.entries(newFollowing)) {
            if (value == null) {
                return  res.status(400).json({
                    error: `${key} is required`
                })
            }
        }

        if (follower_id === friend_id) {
            return res.status(400).json({
                error: `Invalid friend_id`
            })
        }

        friendService.getFriend(
            req.app.get('db'),
            follower_id, 
            friend_id
        )
        .then(alreadyFriends => {
            console.log('alreadyFriends', alreadyFriends)
            if (alreadyFriends) {
                return res.status(400).json({
                    error: `Already friends with ${alreadyFriends.friend_id}`
                })
            }
            console.log('adding new follow')

            //add to database
            friendService.addFollow(
                req.app.get('db'),
                newFollowing
            )
            .then(newFollow => {
                console.log(newFollow)
                return res.status(201).json(newFollow)
            })
        })
        .catch(next)
    })

module.exports = friendRouter