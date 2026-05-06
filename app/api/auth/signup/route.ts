import {signup} from "../../../lib/db";
import {createSession} from "../../../lib/session";
export async function POST(request: Request) {

    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return new Response(
                JSON.stringify({ message: "Missing username or password" }),
                { status: 400 }
            );
        }

        const userId = await signup(username, password);
        if(userId) await createSession(userId, username);

        return new Response(
        JSON.stringify({ message: "Signup successful", userId }),
        { status: 200 }
        );
    } 
    catch (error:any) {
        console.error("Signup error:", error);

        if (error.message === "USERNAME_EXISTS") {
            return new Response(
                JSON.stringify({ message: "Username is already taken" }),
                { status: 409 }
            );
        }

        return new Response(
            JSON.stringify({ message: "Signup failed" }),{
            headers:{
                "Content-Type": "application/json"
            },
            status: 500 });
    }
}