import test from "node:test";
import assert from "node:assert/strict";
import { validateCredentials, validateWatchUpdate } from "../../app/lib/validation.ts";
test("credentials preserve password spaces and normalize usernames once", () => {
  assert.deepEqual(validateCredentials({ username: " movie-lover ", password: " pass word " }), { username: "movie-lover", password: " pass word " });
});
test("credential validation rejects invalid types and bcrypt byte truncation", () => {
  for (const body of [null, [], { username: "", password: "ok" }, { username: 1, password: "ok" }, { username: "ok", password: [] }, { username: "ok", password: "é".repeat(37) }]) assert.equal(validateCredentials(body), null);
  assert.ok(validateCredentials({ username: "ok", password: "é".repeat(36) }));
});
test("watched updates require a positive safe movie ID and an actual boolean", () => {
  assert.deepEqual(validateWatchUpdate({ movieId: "123", completed: false }), { movieId: 123, completed: false });
  assert.deepEqual(validateWatchUpdate({ movieId: 42, completed: true }), { movieId: 42, completed: true });
  for (const movieId of [null, true, [], {}, 0, -1, "1e3", " 2 ", 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.equal(validateWatchUpdate({ movieId, completed: true }), null);
  assert.equal(validateWatchUpdate({ movieId: 42, completed: "false" }), null);
});
