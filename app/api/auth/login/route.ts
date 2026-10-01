import { NextResponse } from "next/server";
import { login } from "@/app/lib/db";
import { createSession } from "@/app/lib/session";
import { validateCredentials } from "@/app/lib/validation";
export async function POST(request: Request) {
  try {
    const credentials = validateCredentials(await request.json().catch(() => null));
    if (!credentials) return NextResponse.json({ message: "Enter a username (up to 100 characters) and password (up to 72 bytes)." }, { status: 400 });
    const userId = await login(credentials.username, credentials.password);
    await createSession(userId, credentials.username);
    return NextResponse.json({ message: "Login successful." });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }
    console.error("Login failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "Login couldn't complete. Please try again." }, { status: 503 });
  }
}
