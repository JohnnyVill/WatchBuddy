import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
let limiters: { general: Ratelimit; auth: Ratelimit } | undefined;
export function getRateLimiters() {
  if (limiters) return limiters;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === "production") throw new Error("Upstash configuration is required in production");
    return null; // Allow a local development server without a Redis account.
  }
  const redis = Redis.fromEnv();
  limiters = {
    general: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, "60 s"), prefix: "app:general", ephemeralCache: new Map(), analytics: true, timeout: 1000 }),
    auth: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "60 s"), prefix: "app:auth", ephemeralCache: new Map(), analytics: true, timeout: 1000 }),
  };
  return limiters;
}
