const bcrypt = require('bcryptjs')

const SignUpService = {
    getUserWithUserName(db, username) {
        return db('movie_suggester_users')
          .where({ username })
          .first()
    },
    insertUser(db, userData) {
        return db
            .insert(userData)
            .into('movie_suggester_users')
            .returning('id')  
            .then(([id]) => id) 
            .catch(error => {
                console.log('duplicate key incriment by 1 after error is caught')
            })
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    }
}

module.exports = SignUpService