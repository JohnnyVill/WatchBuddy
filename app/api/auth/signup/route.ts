import { NextResponse } from "next/server";
import { signup } from "@/app/lib/db";
import { createSession } from "@/app/lib/session";
import { validateCredentials } from "@/app/lib/validation";
export async function POST(request: Request) {
  try {
    const credentials = validateCredentials(await request.json().catch(() => null));
    if (!credentials) return NextResponse.json({ message: "Enter a username (up to 100 characters) and password (up to 72 bytes)." }, { status: 400 });
    const userId = await signup(credentials.username, credentials.password);
    await createSession(userId, credentials.username);
    return NextResponse.json({ message: "Account created." }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_EXISTS") {
      return NextResponse.json({ message: "That username is taken. Try another one." }, { status: 409 });
    }
    console.error("Signup failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "Your account couldn't be created. Please try again." }, { status: 503 });
  }
}
