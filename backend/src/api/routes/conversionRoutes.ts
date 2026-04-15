import { createReadStream } from "node:fs";
import { v4 as uuidv4 } from "uuid";
import type { FastifyInstance } from "fastify";
import { convertRequestSchema } from "../schemas/requests.js";
import { JobService } from "../../application/services/jobService.js";
import { SharpProcessor } from "../../infrastructure/processing/sharpProcessor.js";
import { LocalStorage } from "../../infrastructure/storage/localStorage.js";
import { env } from "../../shared/config.js";
import type { ConversionOptions, UploadedAsset } from "../../domain/types.js";
import { AppError } from "../../shared/errors.js";
import { sendSuccess } from "../../shared/http.js";
import { detectInputCodec } from "../../shared/codec.js";
import { ensureAuthorized } from "../middleware/auth.js";
import { enforceRateLimit } from "../middleware/rateLimit.js";

interface RouteDeps {
  jobService: JobService;
  storage: LocalStorage;
  processor: SharpProcessor;
}

export const registerConversionRoutes = (app: FastifyInstance<any, any, any, any>, deps: RouteDeps) => {
  const protectedPreHandlers = [enforceRateLimit, ensureAuthorized];

  app.get("/health", async (request, reply) => {
    return sendSuccess(reply, request.id, { status: "ok" });
  });

  app.post("/upload", { preHandler: protectedPreHandlers }, async (request, reply) => {
    if (!request.isMultipart()) {
      throw new AppError("VALIDATION_ERROR", "Expected multipart form-data", 400);
    }

    const jobId = uuidv4();
    await deps.storage.ensureJobDirs(jobId);

    const assets: UploadedAsset[] = [];
    const parts = request.parts();
    let totalBytes = 0;

    try {
      for await (const part of parts) {
        if (part.type !== "file") {
          continue;
        }

        if (assets.length >= env.MAX_FILES_PER_UPLOAD) {
          throw new AppError("VALIDATION_ERROR", `Max files per upload is ${env.MAX_FILES_PER_UPLOAD}`, 400);
        }

        const stored = await deps.storage.saveUpload(jobId, part.filename, part.file);

        if (stored.sizeBytes > env.MAX_FILE_SIZE_BYTES) {
          throw new AppError("PAYLOAD_TOO_LARGE", `File ${part.filename} exceeds max size limit`, 413);
        }

        totalBytes += stored.sizeBytes;

        if (totalBytes > env.MAX_TOTAL_UPLOAD_BYTES) {
          throw new AppError("PAYLOAD_TOO_LARGE", "Total upload size exceeds allowed limit", 413);
        }

        const codec = await detectInputCodec(stored.path, stored.fileName);

        if (!env.SUPPORTED_INPUT_CODECS.includes(codec)) {
          throw new AppError("UNSUPPORTED_CODEC", `Input codec ${codec} is not supported`, 400);
        }

        const dimensions = await deps.processor.probeImage(stored.path);

        assets.push({
          assetId: uuidv4(),
          fileName: stored.fileName,
          mimeType: part.mimetype,
          codec,
          width: dimensions.width,
          height: dimensions.height,
          sizeBytes: stored.sizeBytes,
          path: stored.path
        });
      }

      if (assets.length === 0) {
        throw new AppError("VALIDATION_ERROR", "No files were uploaded", 400);
      }

      const job = deps.jobService.createUploadJob(jobId, assets);

      return sendSuccess(
        reply,
        request.id,
        {
          jobId: job.jobId,
          status: job.status,
          createdAt: job.createdAt,
          expiresAt: job.expiresAt,
          files: job.uploadedAssets.map((asset) => ({
            assetId: asset.assetId,
            fileName: asset.fileName,
            codec: asset.codec,
            sizeBytes: asset.sizeBytes,
            width: asset.width,
            height: asset.height
          }))
        },
        201
      );
    } catch (error) {
      await deps.storage.deleteJobArtifacts(jobId);
      throw error;
    }
  });

  app.post("/convert", { preHandler: protectedPreHandlers }, async (request, reply) => {
    const parsed = convertRequestSchema.parse(request.body);

    if (!env.SUPPORTED_OUTPUT_CODECS.includes(parsed.targetCodec)) {
      throw new AppError("UNSUPPORTED_CODEC", `Target codec ${parsed.targetCodec} is not enabled`, 400);
    }

    const options: ConversionOptions = {
      targetCodec: parsed.targetCodec,
      width: parsed.width,
      height: parsed.height,
      qualityMode: parsed.qualityMode ?? "balanced",
      preserveMetadata: parsed.preserveMetadata ?? env.PRESERVE_METADATA_DEFAULT
    };

    const job = deps.jobService.enqueueConversion(parsed.jobId, options);

    return sendSuccess(
      reply,
      request.id,
      {
        jobId: job.jobId,
        status: job.status,
        conversionOptions: job.conversionOptions,
        updatedAt: job.updatedAt
      },
      202
    );
  });

  app.get<{ Params: { id: string } }>(
    "/status/:id",
    { preHandler: protectedPreHandlers },
    async (request, reply) => {
    const job = deps.jobService.getJobOrThrow(request.params.id);

    return sendSuccess(reply, request.id, {
      jobId: job.jobId,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      expiresAt: job.expiresAt,
      conversionOptions: job.conversionOptions,
      summary: job.summary,
      errorMessage: job.errorMessage,
      files: job.convertedAssets.length > 0 ? job.convertedAssets : job.uploadedAssets
    });
    }
  );

  app.get<{ Params: { id: string } }>(
    "/download/:id",
    { preHandler: protectedPreHandlers },
    async (request, reply) => {
    const job = deps.jobService.getJobOrThrow(request.params.id);

    if (job.status !== "completed") {
      throw new AppError("VALIDATION_ERROR", "Job is not completed yet", 409);
    }

    const successfulFiles = job.convertedAssets.filter((asset) => asset.status === "success");

    if (successfulFiles.length === 0) {
      throw new AppError("NOT_FOUND", "No converted files available for download", 404);
    }

    if (successfulFiles.length === 1) {
      const file = successfulFiles[0];
      const stream = createReadStream(file.outputPath);

      reply.header("Content-Disposition", `attachment; filename="${file.outputFileName}"`);
      reply.header("Content-Type", "application/octet-stream");
      return reply.send(stream);
    }

    const zip = await deps.storage.createZip(
      job.jobId,
      successfulFiles.map((file) => ({
        path: file.outputPath,
        name: file.outputFileName
      }))
    );

    reply.header("Content-Disposition", `attachment; filename="${zip.zipName}"`);
    reply.header("Content-Type", "application/zip");

    return reply.send(createReadStream(zip.zipPath));
    }
  );
};
