import archiver from "archiver";
import { createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { v4 as uuidv4 } from "uuid";

export interface StoredUpload {
  path: string;
  fileName: string;
  sizeBytes: number;
}

export class LocalStorage {
  private readonly rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = resolve(rootDir);
  }

  async init() {
    await mkdir(this.rootDir, { recursive: true });
  }

  getUploadsDir(jobId: string) {
    return join(this.rootDir, jobId, "uploads");
  }

  getOutputsDir(jobId: string) {
    return join(this.rootDir, jobId, "outputs");
  }

  private sanitizeName(fileName: string) {
    const base = basename(fileName || "asset");
    return base.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  async ensureJobDirs(jobId: string) {
    await mkdir(this.getUploadsDir(jobId), { recursive: true });
    await mkdir(this.getOutputsDir(jobId), { recursive: true });
  }

  async saveUpload(jobId: string, originalFileName: string, fileStream: NodeJS.ReadableStream): Promise<StoredUpload> {
    const cleanName = this.sanitizeName(originalFileName);
    const fileName = `${uuidv4()}_${cleanName}`;
    const filePath = join(this.getUploadsDir(jobId), fileName);
    const destination = createWriteStream(filePath, { flags: "wx" });

    await pipeline(fileStream, destination);
    const fileStats = await stat(filePath);

    return {
      path: filePath,
      fileName,
      sizeBytes: fileStats.size
    };
  }

  createOutputFilePath(jobId: string, sourceFileName: string, targetCodec: string) {
    const sourceBase = this.sanitizeName(sourceFileName).replace(extname(sourceFileName), "");
    const outputFileName = `${sourceBase}.${targetCodec === "jpg" ? "jpeg" : targetCodec}`;
    return {
      outputPath: join(this.getOutputsDir(jobId), outputFileName),
      outputFileName
    };
  }

  async createZip(jobId: string, files: Array<{ path: string; name: string }>) {
    const zipDir = join(this.rootDir, jobId);
    const zipPath = join(zipDir, `${jobId}_converted.zip`);

    await mkdir(zipDir, { recursive: true });

    await new Promise<void>((resolvePromise, rejectPromise) => {
      const output = createWriteStream(zipPath, { flags: "w" });
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => resolvePromise());
      output.on("error", rejectPromise);
      archive.on("error", rejectPromise);

      archive.pipe(output);

      for (const file of files) {
        archive.file(file.path, { name: file.name });
      }

      void archive.finalize();
    });

    return {
      zipPath,
      zipName: `${jobId}_converted.zip`
    };
  }

  async deleteJobArtifacts(jobId: string) {
    const jobDir = join(this.rootDir, jobId);
    await rm(jobDir, { recursive: true, force: true });
  }
}
