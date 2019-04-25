module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN:  "https://movie-suggester.stevenwagner.now.sh/",
    DB_URL: process.env.DATABASE_URL || 'postgresql://dev@localhost/movie_suggester',
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
}