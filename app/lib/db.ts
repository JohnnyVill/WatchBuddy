//connect to psql database using pg library
import "server-only"
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function signup(username: string, password: string){
  const client = await pool.connect();

  try {
    const result = await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, password]
    );
    return result.rows[0].id;
  } catch (error: any) {
    if (error.code === "23505") {
      throw new Error("USERNAME_EXISTS");
    }
    console.error("Error during signup:", error);
    throw error;
  }
  finally {
    client.release();
  }
  
}

// export async function testDbConnection() {
//   const client = await pool.connect();

//   try {
//     const result = await client.query("SELECT current_database()");
//     console.log("Connected to:", result.rows[0]);
//   } finally {
//     client.release();
//   }
// }