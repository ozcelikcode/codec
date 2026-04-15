import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import { ZodError } from "zod";
import { JobService } from "./application/services/jobService.js";
import { registerConversionRoutes } from "./api/routes/conversionRoutes.js";
import { buildOpenApiDocument } from "./api/openapi.js";
import { SharpProcessor } from "./infrastructure/processing/sharpProcessor.js";
import { InMemoryQueue } from "./infrastructure/queue/inMemoryQueue.js";
import { LocalStorage } from "./infrastructure/storage/localStorage.js";
import { env } from "./shared/config.js";
import { AppError, isAppError } from "./shared/errors.js";
import { sendError } from "./shared/http.js";
import { logger } from "./shared/logger.js";

interface BuildAppOptions {
  tempDir?: string;
  queueConcurrency?: number;
}

export const buildApp = async (options: BuildAppOptions = {}) => {
  const app = Fastify({
    loggerInstance: logger,
    requestIdHeader: "x-request-id",
    requestIdLogLabel: "traceId"
  });

  await app.register(cors, {
    origin: true
  });

  await app.register(helmet);

  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE_BYTES,
      files: env.MAX_FILES_PER_UPLOAD
    }
  });

  const storage = new LocalStorage(options.tempDir ?? env.TEMP_DIR);
  await storage.init();

  const queue = new InMemoryQueue(options.queueConcurrency ?? env.QUEUE_CONCURRENCY);
  const processor = new SharpProcessor();
  const jobService = new JobService(queue, storage, processor);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return sendError(reply, request.id, 400, "VALIDATION_ERROR", "Request validation failed", error.flatten());
    }

    if (isAppError(error)) {
      return sendError(reply, request.id, error.statusCode, error.code, error.message, error.details);
    }

    if (error instanceof AppError) {
      return sendError(reply, request.id, error.statusCode, error.code, error.message, error.details);
    }

    request.log.error({ error }, "Unexpected error");
    return sendError(reply, request.id, 500, "INTERNAL_ERROR", "Unexpected server error");
  });

  const dependencies = {
    jobService,
    storage,
    processor
  };

  const normalizedPrefix = normalizePrefix(env.API_PREFIX);
  const openApiDocument = buildOpenApiDocument({
    apiPrefix: normalizedPrefix,
    includeLegacyRoutes: env.LEGACY_UNVERSIONED_ROUTES_ENABLED
  });

  await app.register(
    async (instance) => {
      registerConversionRoutes(instance, dependencies);
    },
    {
      prefix: normalizedPrefix
    }
  );

  if (env.LEGACY_UNVERSIONED_ROUTES_ENABLED) {
    await app.register(async (instance) => {
      registerConversionRoutes(instance, dependencies);
    });
  }

  app.get(joinPrefixedPath(normalizedPrefix, "/openapi.json"), async (_request, reply) => {
    return reply.status(200).send(openApiDocument);
  });

  if (env.LEGACY_UNVERSIONED_ROUTES_ENABLED && normalizedPrefix !== "/") {
    app.get("/openapi.json", async (_request, reply) => {
      return reply.status(200).send(openApiDocument);
    });
  }

  return {
    app,
    jobService
  };
};

const normalizePrefix = (value: string) => {
  if (!value || value === "/") {
    return "/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
};

const joinPrefixedPath = (prefix: string, route: string) => {
  if (prefix === "/") {
    return route;
  }

  return `${prefix}${route}`;
};
