const bcrypt = require('bcryptjs')

function makeUsersArray() {
    return [
        {
        id: 1,
        username: 'dunder', 
        first_name: 'Dunder', 
        last_name: 'Mifflin', 
        password: 'password',
        bio: 'A test bio'
        },
        {
        id: 2,
        username: 'b.deboop', 
        first_name: 'Bodeep', 
        last_name: 'Deboop', 
        password: "password1", 
        bio: 'Another bio'
        },
        {
        id: 3,
        username: 's.smith', 
        first_name: 'Sam',
        last_name: 'Smith',
        password: "password2", 
        bio: ''
        },
        {
        id: 4,
        username: 'lexlor',
        first_name: 'Alex',
        last_name: 'Taylor',
        password: 'password3', 
        bio: ''
        },
    ]
}

function makeArticlesFixtures() {
    const testUsers = makeUsersArray()
    return { testUsers }
}

function cleanTables(db) {
    return db.raw(
      `TRUNCATE
        movie_suggester_users
        RESTART IDENTITY CASCADE`
    )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db
      .into('movie_suggester_users')
      .insert(preppedUsers)
  }

function newUser() {
    return {
        username: 'NewTestUser', 
        first_name: 'Test', 
        last_name: 'User', 
        password: 'password',
        bio: 'A testUser bio'
        }
}

module.exports = {
    makeUsersArray,
    cleanTables,
    seedUsers,
    newUser,

    makeArticlesFixtures
}