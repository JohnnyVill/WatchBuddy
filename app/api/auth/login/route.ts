import { login } from "../../../lib/db";
import { createSession } from "../../../lib/session";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return new Response(
                JSON.stringify({ message: "Missing username or password." }),
                { status: 400 }
            );
        }

        const userId = await login(username, password);
        if (userId) {
            await createSession(userId, username);
        }

        return new Response(
            JSON.stringify({ message: "Login successful." }),
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
            return new Response(
                JSON.stringify({ message: "Invalid username or password." }),
                { status: 401 }
            );
        }

        console.error("Login error:", error instanceof Error ? error.message : "Unknown error");
        return new Response(
            JSON.stringify({ message: "Login failed. Please try again later." }),
            { status: 500 }
        );
    }
}