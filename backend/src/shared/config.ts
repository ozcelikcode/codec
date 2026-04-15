import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback;
  }

  if (value.toLowerCase() === "true") {
    return true;
  }

  if (value.toLowerCase() === "false") {
    return false;
  }

  return fallback;
};

const parseList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseNumber(process.env.PORT, 8080),
  HOST: process.env.HOST ?? "0.0.0.0",
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  MAX_FILE_SIZE_BYTES: parseNumber(process.env.MAX_FILE_SIZE_BYTES, 100 * 1024 * 1024),
  MAX_FILES_PER_UPLOAD: parseNumber(process.env.MAX_FILES_PER_UPLOAD, 20),
  MAX_TOTAL_UPLOAD_BYTES: parseNumber(process.env.MAX_TOTAL_UPLOAD_BYTES, 500 * 1024 * 1024),
  SUPPORTED_INPUT_CODECS: parseList(process.env.SUPPORTED_INPUT_CODECS, [
    "jpeg",
    "jpg",
    "png",
    "webp",
    "avif",
    "tiff",
    "heic",
    "heif",
    "raw",
    "svg"
  ]),
  SUPPORTED_OUTPUT_CODECS: parseList(process.env.SUPPORTED_OUTPUT_CODECS, ["jpeg", "jpg", "png", "webp", "avif"]),
  TEMP_DIR: process.env.TEMP_DIR ?? ".tmp",
  RETENTION_MINUTES: parseNumber(process.env.RETENTION_MINUTES, 60),
  QUEUE_CONCURRENCY: parseNumber(process.env.QUEUE_CONCURRENCY, 2),
  PRESERVE_METADATA_DEFAULT: parseBoolean(process.env.PRESERVE_METADATA_DEFAULT, true)
} as const;
