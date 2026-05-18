//connect to psql database using pg library
import "server-only"
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export async function signup(username: string, password: string) {
  const client = await pool.connect();

  try {
    const checkUser = await client.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (checkUser.rows.length > 0) {
      throw new Error("USERNAME_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );
    return result.rows[0].id;
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_EXISTS") {
      throw error;
    }
    console.error("Signup failed:", error instanceof Error ? error.message : "Unknown error");
    throw new Error("DB_WRITE_FAILED");
  } finally {
    client.release();
  }
}

export async function login(username: string, loginPassword: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, password FROM users WHERE username = $1",
      [username]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(loginPassword, user.password);
      if (passwordMatch) {
        return user.id;
      } else {
        throw new Error("INVALID_CREDENTIALS");
      }
    } else {
      throw new Error("INVALID_CREDENTIALS");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      throw error;
    }
    console.error("Login failed:", error instanceof Error ? error.message : "Unknown error");
    throw new Error("DB_READ_FAILED");
  } finally {
    client.release();
  }
}

export async function watchedMovie(userID: Number, watched: boolean, movieID: Number) {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO watch_history (user_id, tmdb_id, completed) VALUES ($1, $2, $3) ON CONFLICT (user_id, tmdb_id) DO UPDATE SET completed = EXCLUDED.completed",
      [userID, movieID, watched]
    );
  } catch (error) {
    console.error("Failed to update watch history:", error instanceof Error ? error.message : "Unknown error");
    throw new Error("DB_WRITE_FAILED");
  } finally {
    client.release();
  }
}

export async function getMovieById(userID: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT tmdb_id FROM watch_history WHERE completed = true AND user_id = $1 ORDER BY last_watched_at ASC",
      [userID]
    );
    return result.rows;
  } catch (error) {
    console.error("Failed to fetch watch history:", error instanceof Error ? error.message : "Unknown error");
    throw new Error("DB_READ_FAILED");
  } finally {
    client.release();
  }
}