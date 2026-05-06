//connect to psql database using pg library
import "server-only"
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function signup(username: string, password: string){
  const client = await pool.connect();

  try {
    const checkUser = await client.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (checkUser.rows.length > 0) {
      throw new Error("USERNAME_EXISTS");
    }
    else {
      //password hashing
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await client.query(
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
        [username, hashedPassword]
      );
      return result.rows[0].id;
    }
  } catch (error: any) {
    console.error("Error during signup:", error);
    throw error;
  }
  finally {
    client.release();
  }
  
}

export async function login(username: string, loginPassword: string) {
  const client = await pool.connect();
  try{
    const result = await client.query(
      "SELECT id, password FROM users WHERE username = $1",
      [username]
    )
    if(result.rows.length > 0){
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(loginPassword, user.password);
      if(passwordMatch){
        return user.id;
      }else{
        throw new Error("INVALID_CREDENTIALS");
      }
    }else{
      throw new Error("INVALID_CREDENTIALS");
    }
  }catch(error:any){
    console.error("Error during login:", error);
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