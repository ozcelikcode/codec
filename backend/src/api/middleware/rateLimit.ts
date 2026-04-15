import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../shared/config.js";
import { AppError } from "../../shared/errors.js";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export const enforceRateLimit = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!env.ENABLE_RATE_LIMIT) {
    return;
  }

  const now = Date.now();
  const key = request.ip || "unknown";
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, {
      count: 1,
      resetAt: now + env.RATE_LIMIT_WINDOW_MS
    });
    return;
  }

  existing.count += 1;
  buckets.set(key, existing);

  if (existing.count > env.RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterMs = Math.max(0, existing.resetAt - now);
    reply.header("Retry-After", Math.ceil(retryAfterMs / 1000));

    throw new AppError("RATE_LIMITED", "Too many requests", 429, {
      retryAfterMs
    });
  }
};
