import { login } from "../../../lib/db";

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
        return new Response(
            JSON.stringify({ message: "Login successful", userId }),
            { status: 200 }
        );
        
    } catch (error) {
        return new Response(
            JSON.stringify({ message: "Invalid credentials" }),
            { status: 401 }
        );
    }
}