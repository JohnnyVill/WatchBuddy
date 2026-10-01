import "server-only";
import { Pool } from "pg";
import bcrypt from "bcrypt";
const globalForDb = globalThis as unknown as { watchBuddyPool?: Pool };
export const pool = globalForDb.watchBuddyPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : true,
  connectionTimeoutMillis: 5000,
});
if (process.env.NODE_ENV !== "production") globalForDb.watchBuddyPool = pool;
export async function signup(username: string, password: string): Promise<number> {
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    const result = await pool.query<{ id: number }>(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id", [username, hashedPassword],
    );
    return result.rows[0].id;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") throw new Error("USERNAME_EXISTS");
    throw new Error("DB_WRITE_FAILED");
  }
}
export async function login(username: string, password: string): Promise<number> {
  const result = await pool.query<{ id: number; password: string }>("SELECT id, password FROM users WHERE username = $1", [username]);
  const user = result.rows[0];
  if (!user || !await bcrypt.compare(password, user.password)) throw new Error("INVALID_CREDENTIALS");
  return user.id;
}
export async function watchedMovie(userId: number, completed: boolean, movieId: number) {
  await pool.query(
    `INSERT INTO watch_history (user_id, tmdb_id, completed, last_watched_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id, tmdb_id) DO UPDATE SET completed = EXCLUDED.completed,
     last_watched_at = CASE WHEN EXCLUDED.completed THEN CURRENT_TIMESTAMP ELSE watch_history.last_watched_at END`,
    [userId, movieId, completed],
  );
}
export async function getMovieById(userId: number) {
  const result = await pool.query<{ tmdb_id: number }>(
    "SELECT tmdb_id FROM watch_history WHERE completed = true AND user_id = $1 ORDER BY last_watched_at DESC, tmdb_id DESC", [userId],
  );
  return result.rows;
}
