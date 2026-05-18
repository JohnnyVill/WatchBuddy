import { signup } from "../../../lib/db";
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

        const userId = await signup(username, password);
        if (userId) await createSession(userId, username);

        return new Response(
            JSON.stringify({ message: "Signup successful." }),
            { status: 200 }
        );
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "USERNAME_EXISTS") {
            return new Response(
                JSON.stringify({ message: "Username is already taken." }),
                { status: 409 }
            );
        }

        console.error("Signup error:", error instanceof Error ? error.message : "Unknown error");
        return new Response(
            JSON.stringify({ message: "Signup failed. Please try again." }),
            { status: 500 }
        );
    }
}