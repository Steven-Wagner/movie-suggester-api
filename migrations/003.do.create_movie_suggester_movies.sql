CREATE TABLE movie_suggester_movies (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title text not null,
    director text,
    img text,
    release_year text not null,
    imdb_id text,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);