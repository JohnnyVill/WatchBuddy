export function validateCredentials(body: unknown): { username: string; password: string } | null {
  if (!body || typeof body !== "object") return null;
  const { username, password } = body as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") return null;
  if (!username.trim() || username.length > 100 || !password || Buffer.byteLength(password, "utf8") > 72) return null;
  // Passwords are never normalized; bcrypt compares their original bytes.
  return { username: username.trim(), password };
}
export function validateWatchUpdate(body: unknown): { movieId: number; completed: boolean } | null {
  if (!body || typeof body !== "object") return null;
  const { movieId, completed } = body as Record<string, unknown>;
  if (typeof movieId !== "number" && typeof movieId !== "string") return null;
  if (typeof movieId === "string" && !/^\d+$/.test(movieId)) return null;
  const id = Number(movieId);
  if (!Number.isSafeInteger(id) || id <= 0 || typeof completed !== "boolean") return null;
  return { movieId: id, completed };
}
