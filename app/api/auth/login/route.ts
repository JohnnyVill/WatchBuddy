import { login} from "../../../lib/db";
import {createSession} from "../../../lib/session";
import { authRateLimit } from "../../../middleware";

export async function POST(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ip = forwardedFor?.split(",")[0] ?? "anonymous"

    const { success, limit, remaining, reset } = await authRateLimit.limit(`${ip}:login`)

    if (!success) {
        return new Response(
            JSON.stringify({ message: "Too many requests" }),
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": String(limit),
                    "X-RateLimit-Remaining": String(remaining),
                    "X-RateLimit-Reset": String(reset),
                    "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
                },
            }
        )
    }
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

    } catch {
        return new Response(
            JSON.stringify({ message: "Invalid credentials" }),
            { status: 401 }
        );
    }
}
