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
            .returning('*')  
            .then(([user]) => user.id)      
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    }
}

module.exports = SignUpService