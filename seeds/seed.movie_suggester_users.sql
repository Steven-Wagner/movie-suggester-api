INSERT INTO movie_suggester_users (username, first_name, last_name, password, bio)
VALUES
  ('dunder', 'Dunder', 'Mifflin', '$2a$12$43myt92GEBNHM5tB960oVuKqvMElgiubBxZw6v3WubxG5YqEGkgPe', 'A test bio'),
  ('b.deboop', 'Bodeep', 'Deboop', '$2a$12$ca9oFnwgj9WCFcXO8BUUr.8Rlo0ZlHo/cLwQWaNJxsOeYmbkYoRU6', 'Another bio'),
  ('s.smith', 'Sam', 'Smith','$2a$12$PY6DcHi3lzKgjWFizDXezeMdCOPXGvZjhKA6j7n1oBhA1TRWGz74e', ''),
  ('lexlor', 'Alex', 'Taylor', '$2a$12$l00PXYQS/AY5RAiN48snge2hohq3bMZI8bQPBnssKrf0oHkfQX1zS', '');

INSERT INTO movie_suggester_follows (follower_id, friend_id)
VALUES
  (1, 2),
  (2, 1),
  (1, 3),
  (2, 3);

INSERT INTO movie_suggester_movies (title, director, img, release_year, imdb_id)
VALUES
  ('Jaws', 'Steven Spielberg', 'https://m.media-amazon.com/images/M/MV5BMmVmODY1MzEtYTMwZC00MzNhLWFkNDMtZjAwM2EwODUxZTA5XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_SX300.jpg', '1975', 'tt0073195'),
  ('Se7en', 'David Fincher', 'https://m.media-amazon.com/images/M/MV5BOTUwODM5MTctZjczMi00OTk4LTg3NWUtNmVhMTAzNTNjYjcyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg', '1995', 'tt0114369'),
  ('Shrek', 'Andrew Adamson, Vicky Jenson', 'https://m.media-amazon.com/images/M/MV5BOGZhM2FhNTItODAzNi00YjA0LWEyN2UtNjJlYWQzYzU1MDg5L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',  '2001', 'tt0126029');

INSERT INTO movie_suggester_movie_ratings (user_id, movie_id, star_rating)
VALUES
  (1, 1, 3),
  (2, 1, 3),
  (2, 2, 5),
  (1, 2, 5),
  (3, 1, 1),
  (3, 2, 4),
  (1, 3, 1),
  (2, 3, 5),
  (3, 3, 2);