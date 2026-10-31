import { jwtVerify, SignJWT } from "jose";
function normalizeUserId(value: unknown): number {
  // PostgreSQL bigint IDs arrive as strings; never coerce other payload types.
  const id = typeof value === "string" && /^[0-9]+$/.test(value) ? Number(value) : value;
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1) throw new Error("Invalid user ID");
  return id;
}
export type SessionPayload = { userId: number; username?: string; expiresAt: Date | string };
function signingKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || new TextEncoder().encode(secret).length < 32) throw new Error("SESSION_SECRET must contain at least 32 bytes");
  return new TextEncoder().encode(secret);
}
export async function encrypt(payload: SessionPayload) {
  const userId = normalizeUserId(payload.userId);
  return new SignJWT({ ...payload, userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(signingKey());
}
export async function decrypt(session: string): Promise<SessionPayload> {
  try {
    const { payload } = await jwtVerify(session, signingKey(), { algorithms: ["HS256"] });
    const userId = normalizeUserId(payload.userId);
    if ((payload.username !== undefined && typeof payload.username !== "string") ||
      typeof payload.expiresAt !== "string") throw new Error("Invalid payload");
    return { userId, username: payload.username, expiresAt: payload.expiresAt };
  } catch { throw new Error("INVALID_SESSION"); }
}
