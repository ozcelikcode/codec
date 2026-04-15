import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../shared/config.js";
import { AppError } from "../../shared/errors.js";

export const ensureAuthorized = async (request: FastifyRequest, _reply: FastifyReply) => {
  if (!env.ENABLE_API_KEY_AUTH) {
    return;
  }

  if (!env.API_KEY) {
    throw new AppError("INTERNAL_ERROR", "API key auth is enabled but API_KEY is not configured", 500);
  }

  const headerValue = request.headers["x-api-key"];
  const providedKey = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (!providedKey || providedKey !== env.API_KEY) {
    throw new AppError("UNAUTHORIZED", "Missing or invalid API key", 401);
  }
};
