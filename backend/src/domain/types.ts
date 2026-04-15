export const JOB_STATUS = {
  uploaded: "uploaded",
  queued: "queued",
  processing: "processing",
  completed: "completed",
  failed: "failed",
  expired: "expired"
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const QUALITY_MODE = {
  balanced: "balanced",
  quality: "quality",
  size: "size"
} as const;

export type QualityMode = (typeof QUALITY_MODE)[keyof typeof QUALITY_MODE];

export const CODEC_OUTPUT = {
  jpeg: "jpeg",
  jpg: "jpg",
  png: "png",
  webp: "webp",
  avif: "avif"
} as const;

export type OutputCodec = (typeof CODEC_OUTPUT)[keyof typeof CODEC_OUTPUT];

export type InputCodec =
  | "jpeg"
  | "jpg"
  | "png"
  | "webp"
  | "avif"
  | "tiff"
  | "heic"
  | "heif"
  | "raw"
  | "svg"
  | "unknown";

export interface UploadedAsset {
  assetId: string;
  fileName: string;
  mimeType: string;
  codec: InputCodec;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  path: string;
}

export interface ConvertedAsset {
  assetId: string;
  sourceCodec: InputCodec;
  targetCodec: OutputCodec;
  originalSizeBytes: number;
  convertedSizeBytes: number;
  originalWidth: number | null;
  originalHeight: number | null;
  outputWidth: number | null;
  outputHeight: number | null;
  outputPath: string;
  outputFileName: string;
  status: "success" | "failed";
  errorMessage?: string;
}

export interface ConversionOptions {
  targetCodec: OutputCodec;
  width?: number;
  height?: number;
  qualityMode: QualityMode;
  preserveMetadata: boolean;
}

export interface ConversionSummary {
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  totalOriginalSizeBytes: number;
  totalConvertedSizeBytes: number;
}

export interface ConversionJob {
  jobId: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  uploadedAssets: UploadedAsset[];
  convertedAssets: ConvertedAsset[];
  conversionOptions?: ConversionOptions;
  summary?: ConversionSummary;
  errorMessage?: string;
}
