import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
export type SessionPayload = { userId: number; username?: string; expiresAt: Date | string };
function signingKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || new TextEncoder().encode(secret).length < 32) throw new Error("SESSION_SECRET must contain at least 32 bytes");
  return new TextEncoder().encode(secret);
}
export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(signingKey());
}
export async function decrypt(session: string): Promise<SessionPayload> {
  try {
    const { payload } = await jwtVerify(session, signingKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "number" || !Number.isSafeInteger(payload.userId) || payload.userId < 1 ||
      (payload.username !== undefined && typeof payload.username !== "string") ||
      typeof payload.expiresAt !== "string") throw new Error("Invalid payload");
    return { userId: payload.userId, username: payload.username, expiresAt: payload.expiresAt };
  } catch { throw new Error("INVALID_SESSION"); }
}
export async function createSession(userId: number, username?: string) {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const token = await encrypt({ userId, username, expiresAt });
  (await cookies()).set("userSession", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt,
  });
}
export async function getSession() {
  const token = (await cookies()).get("userSession")?.value;
  if (!token) return null;
  try { return await decrypt(token); } catch { return null; }
}
export async function clearSession() { (await cookies()).delete("userSession"); }
