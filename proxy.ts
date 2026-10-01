import { NextRequest, NextResponse } from "next/server";
import { getRateLimiters } from "./app/lib/rateLimit";
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/")) {
    try {
      const limiters = getRateLimiters();
      if (limiters) {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
        const auth = path.startsWith("/api/auth/");
        const { success, limit, remaining, reset } = await (auth ? limiters.auth : limiters.general).limit(`${ip}:${auth ? "auth" : "api"}`);
        if (!success) return NextResponse.json({ message: "Too many requests. Please try again shortly." }, {
          status: 429,
          headers: { "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining), "X-RateLimit-Reset": String(reset), "Retry-After": String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))) },
        });
      }
    } catch {
      return NextResponse.json({ message: "This service is temporarily unavailable. Please try again." }, { status: 503 });
    }
  }
  const response = NextResponse.next();
  if (!path.startsWith("/api/")) {
    const token = request.cookies.get("userSession")?.value;
    if (token) {
      try {
        const { decrypt, encrypt } = await import("./app/lib/session");
        const session = await decrypt(token);
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
        response.cookies.set("userSession", await encrypt({ ...session, expiresAt }), {
          httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt,
        });
      } catch { response.cookies.delete("userSession"); }
    }
  }
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.ico).*)"] };
