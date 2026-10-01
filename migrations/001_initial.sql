CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username);
CREATE TABLE IF NOT EXISTS watch_history (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL CHECK (tmdb_id > 0),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS last_watched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS watch_history_user_movie_unique ON watch_history (user_id, tmdb_id);
CREATE INDEX IF NOT EXISTS watch_history_completed_recent ON watch_history (user_id, last_watched_at DESC) WHERE completed = TRUE;
