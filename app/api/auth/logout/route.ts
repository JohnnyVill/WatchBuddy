import { clearSession } from "@/app/lib/session";
import { authRateLimit } from "../../../middleware";

export async function POST(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ip = forwardedFor?.split(",")[0] ?? "anonymous"

    const { success, limit, remaining, reset } = await authRateLimit.limit(`${ip}:logout`)

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

    await clearSession();

    return new Response("Logged out successfully", {
        status: 200,
    });
}
