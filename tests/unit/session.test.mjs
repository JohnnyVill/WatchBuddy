import test from 'node:test';
import assert from 'node:assert/strict';
import { SignJWT } from 'jose';
import { encrypt, decrypt } from '../../app/lib/sessionToken.ts';
process.env.SESSION_SECRET = 'watchbuddy-session-regression-secret-32-bytes';
const expiresAt = new Date(Date.now() + 7200000).toISOString();
async function signed(userId, expiration = '2h') {
  return new SignJWT({ userId, username: 'movie-lover', expiresAt })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime(expiration)
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
}
test('new sessions round-trip numeric and PostgreSQL string user IDs', async () => {
  for (const userId of [42, '42']) {
    const session = await decrypt(await encrypt({ userId, username: 'movie-lover', expiresAt: new Date(expiresAt) }));
    assert.deepEqual(session, { userId: 42, username: 'movie-lover', expiresAt });
  }
});
test('existing signed sessions with string user IDs remain usable', async () => {
  assert.equal((await decrypt(await signed('42'))).userId, 42);
});
test('invalid user IDs cannot create or authenticate sessions', async () => {
  for (const userId of [0, -1, 1.5, '1e3', ' 42 ', '', true, null, {}, [], '9007199254740993']) {
    await assert.rejects(encrypt({ userId, expiresAt }));
    await assert.rejects(decrypt(await signed(userId)), /INVALID_SESSION/);
  }
});
test('expired and tampered sessions are rejected', async () => {
  await assert.rejects(decrypt(await signed('42', '-1h')), /INVALID_SESSION/);
  const token = await signed('42');
  await assert.rejects(decrypt(token.slice(0, -8) + 'abcdefgh'), /INVALID_SESSION/);
});
