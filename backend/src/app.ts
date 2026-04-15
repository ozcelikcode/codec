import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import { ZodError } from "zod";
import { JobService } from "./application/services/jobService.js";
import { registerConversionRoutes } from "./api/routes/conversionRoutes.js";
import { SharpProcessor } from "./infrastructure/processing/sharpProcessor.js";
import { InMemoryQueue } from "./infrastructure/queue/inMemoryQueue.js";
import { LocalStorage } from "./infrastructure/storage/localStorage.js";
import { env } from "./shared/config.js";
import { AppError, isAppError } from "./shared/errors.js";
import { sendError } from "./shared/http.js";
import { logger } from "./shared/logger.js";

export const buildApp = async () => {
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

  const storage = new LocalStorage(env.TEMP_DIR);
  await storage.init();

  const queue = new InMemoryQueue(env.QUEUE_CONCURRENCY);
  const processor = new SharpProcessor();
  const jobService = new JobService(queue, storage, processor);

  registerConversionRoutes(app, {
    jobService,
    storage,
    processor
  });

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

  return {
    app,
    jobService
  };
};
