import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Shared ephemeral cache reduces Redis round-trips for repeat requests
// from the same identifier within a serverless function's lifetime.
const cache = new Map();

// General API rate limiter: 100 requests per 60s sliding window
export const generalLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '60 s'),
  prefix: 'app:general',
  ephemeralCache: cache,
  analytics: true,
  timeout: 1000, // 1s — fail-open if Redis is unreachable
});

// Auth endpoints rate limiter: 20 requests per 60s sliding window
export const authLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '60 s'),
  prefix: 'app:auth',
  ephemeralCache: cache,
  analytics: true,
  timeout: 1000,
});
