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

export async function watchedMovie(userID:Number, watched: boolean, movieID: Number){
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT completed FROM watch_history WHERE user_id = $1 AND tmdb_id = $2", [userID, movieID])
    if(result.rows.length > 0){
      try{
        const updateDb = await client.query("UPDATE watch_history SET completed = $1 WHERE user_id = $2 AND tmdb_id = $3",
          [watched, userID, movieID]
        )
        console.log("Updated watch history table")
      }
      catch(error){
        console.log("error in updating table row", error)
      }
      
    }else{
      try {
        const insertDb = await client.query('INSERT INTO watch_history (user_id, tmdb_id, completed) VALUES ($1,$2, $3)', 
          [userID, movieID, watched])
        console.log("Insert in watch history table")
      } catch (error) {
        console.log("error in inserting into watch history ", error)
      }
    }
  } catch (error) {
    console.log("could not connect: ", error)
  }
  finally{
    client.release();
  }
}

export async function getMovieById(userID: number){
  const client = await pool.connect();

  try{
    const getMovieId = await client.query("SELECT w.tmdb_id FROM watch_history w JOIN users u ON w.user_id = u.id WHERE w.completed = true AND u.id = $1 ORDER BY w.last_watched_at ASC;", 
      [userID]
    )
    return getMovieId.rows;
  }
  catch(error){
    console.log("Error is fetching watch history", error);
  }
  finally{
    client.release();
  }
}