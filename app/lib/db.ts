//connect to psql database using pg library
import "server-only"
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function testDbConnection() {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT current_database()");
    console.log("Connected to:", result.rows[0]);
  } finally {
    client.release();
  }
}