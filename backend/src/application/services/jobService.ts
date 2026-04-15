import { stat } from "node:fs/promises";
import { env } from "../../shared/config.js";
import { AppError } from "../../shared/errors.js";
import {
  JOB_STATUS,
  QUALITY_MODE,
  type ConversionJob,
  type ConversionOptions,
  type ConvertedAsset,
  type ConversionSummary,
  type UploadedAsset
} from "../../domain/types.js";
import { SharpProcessor } from "../../infrastructure/processing/sharpProcessor.js";
import { InMemoryQueue } from "../../infrastructure/queue/inMemoryQueue.js";
import { LocalStorage } from "../../infrastructure/storage/localStorage.js";

export class JobService {
  private readonly jobs = new Map<string, ConversionJob>();

  constructor(
    private readonly queue: InMemoryQueue,
    private readonly storage: LocalStorage,
    private readonly processor: SharpProcessor
  ) {}

  createUploadJob(jobId: string, uploadedAssets: UploadedAsset[]) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + env.RETENTION_MINUTES * 60 * 1000);

    const job: ConversionJob = {
      jobId,
      status: JOB_STATUS.uploaded,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      uploadedAssets,
      convertedAssets: []
    };

    this.jobs.set(jobId, job);
    return job;
  }

  getJob(jobId: string) {
    return this.jobs.get(jobId);
  }

  getJobOrThrow(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new AppError("NOT_FOUND", "Job not found", 404);
    }

    return job;
  }

  enqueueConversion(jobId: string, options: ConversionOptions) {
    const job = this.getJobOrThrow(jobId);

    if (job.status === JOB_STATUS.processing || job.status === JOB_STATUS.queued) {
      throw new AppError("VALIDATION_ERROR", "Job is already in progress", 409);
    }

    if (job.status === JOB_STATUS.expired) {
      throw new AppError("VALIDATION_ERROR", "Job has expired", 410);
    }

    if (job.uploadedAssets.length === 0) {
      throw new AppError("VALIDATION_ERROR", "No uploaded assets found for this job", 400);
    }

    job.status = JOB_STATUS.queued;
    job.conversionOptions = {
      ...options,
      qualityMode: options.qualityMode ?? QUALITY_MODE.balanced
    };
    job.updatedAt = new Date().toISOString();

    this.queue.enqueue(async () => {
      await this.processJob(jobId);
    });

    return job;
  }

  async cleanupExpiredJobs() {
    const now = Date.now();

    for (const [jobId, job] of this.jobs) {
      if (new Date(job.expiresAt).getTime() <= now && job.status !== JOB_STATUS.expired) {
        job.status = JOB_STATUS.expired;
        job.updatedAt = new Date().toISOString();
        await this.storage.deleteJobArtifacts(jobId);
      }
    }
  }

  private async processJob(jobId: string) {
    const job = this.getJobOrThrow(jobId);
    const options = job.conversionOptions;

    if (!options) {
      throw new AppError("VALIDATION_ERROR", "Missing conversion options", 400);
    }

    job.status = JOB_STATUS.processing;
    job.updatedAt = new Date().toISOString();

    const convertedAssets: ConvertedAsset[] = [];

    for (const asset of job.uploadedAssets) {
      try {
        const output = this.storage.createOutputFilePath(job.jobId, asset.fileName, options.targetCodec);

        const dimensions = await this.processor.convertAsset(asset, options, output.outputPath);
        const outputStats = await stat(output.outputPath);

        convertedAssets.push({
          assetId: asset.assetId,
          sourceCodec: asset.codec,
          targetCodec: options.targetCodec,
          originalSizeBytes: asset.sizeBytes,
          convertedSizeBytes: outputStats.size,
          originalWidth: asset.width,
          originalHeight: asset.height,
          outputWidth: dimensions.width,
          outputHeight: dimensions.height,
          outputPath: output.outputPath,
          outputFileName: output.outputFileName,
          status: "success"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown processing error";

        convertedAssets.push({
          assetId: asset.assetId,
          sourceCodec: asset.codec,
          targetCodec: options.targetCodec,
          originalSizeBytes: asset.sizeBytes,
          convertedSizeBytes: 0,
          originalWidth: asset.width,
          originalHeight: asset.height,
          outputWidth: null,
          outputHeight: null,
          outputPath: "",
          outputFileName: "",
          status: "failed",
          errorMessage: message
        });
      }
    }

    job.convertedAssets = convertedAssets;
    job.summary = this.calculateSummary(convertedAssets);
    job.status = convertedAssets.some((item) => item.status === "success") ? JOB_STATUS.completed : JOB_STATUS.failed;
    job.errorMessage = job.status === JOB_STATUS.failed ? "All file conversions failed" : undefined;
    job.updatedAt = new Date().toISOString();
  }

  private calculateSummary(assets: ConvertedAsset[]): ConversionSummary {
    const totalOriginalSizeBytes = assets.reduce((sum, asset) => sum + asset.originalSizeBytes, 0);
    const totalConvertedSizeBytes = assets.reduce((sum, asset) => sum + asset.convertedSizeBytes, 0);
    const successfulFiles = assets.filter((asset) => asset.status === "success").length;

    return {
      totalFiles: assets.length,
      successfulFiles,
      failedFiles: assets.length - successfulFiles,
      totalOriginalSizeBytes,
      totalConvertedSizeBytes
    };
  }
}
