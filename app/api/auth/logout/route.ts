import { clearSession } from "@/app/lib/session";

export async function POST() {
    await clearSession();
    return new Response("Logged out successfully.", { status: 200 });
}