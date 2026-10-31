import "server-only";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "./sessionToken";
export { encrypt, decrypt } from "./sessionToken";
export type { SessionPayload } from "./sessionToken";
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
