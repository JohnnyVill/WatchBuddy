import { login } from "../../../lib/db";
import {createSession} from "../../../lib/session";

export async function POST(request: Request) {
    try {
        const {username, password} = await request.json();
        if (!username || !password) {
            return new Response(
                JSON.stringify({ message: "Missing username or password" }),
                { status: 400 }
            );
        }
        const userId = await login(username, password);
        if(userId){
            await createSession(userId, username);
        }
        return new Response(
            JSON.stringify({ message: "Login successful"}),
            { status: 200 }
        );
        
    } catch (error) {
        return new Response(
            JSON.stringify({ message: "Invalid credentials" }),
            { status: 401 }
        );
    }
}