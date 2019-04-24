const express = require('express')
const SignUpService = require('./signUp-service')
const AuthService = require('../auth/auth-service')

const signUpRouter = express.Router()
const jsonBodyParser = express.json()

signUpRouter
    .post('', jsonBodyParser, (req, res, next) => {
        const {username, password, bio, first_name, last_name} = req.body
        const newUser = {username, password}

        for (const [key, value] of Object.entries(newUser)) {
            if (value == null) {
                return  res.status(400).json({
                    error: `${key} is required`
                })
            }
        }

        Object.assign(newUser, {bio, first_name, last_name, date_created: 'now()'})
        
        return SignUpService.getUserWithUserName(
            req.app.get('db'), 
            username
        )
        .then(isUsernameInvalid => {
            if (isUsernameInvalid) {
                return res.status(400).json({
                    error: `username already exists`
                })
            }

            //add new user to database
            return SignUpService.hashPassword(password)
            .then(hashedPassword => {

                newUser.password = hashedPassword;

                return SignUpService.insertUser(
                    req.app.get('db'),
                    newUser
                )
                .then(newId => {
                    const sub = newUser.username
                    const payload = {user_id: newId}
                    return res.status(201).send({
                    authToken: AuthService.createJwt(sub, payload),
                    user_id: newId
                    })
                })
            })
        })
    })

module.exports = signUpRouter