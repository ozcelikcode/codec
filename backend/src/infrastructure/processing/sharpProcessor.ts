import sharp from "sharp";
import { AppError } from "../../shared/errors.js";
import type { ConversionOptions, UploadedAsset } from "../../domain/types.js";

export interface ProbeResult {
  width: number | null;
  height: number | null;
}

export class SharpProcessor {
  async probeImage(filePath: string): Promise<ProbeResult> {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width ?? null,
        height: metadata.height ?? null
      };
    } catch {
      return {
        width: null,
        height: null
      };
    }
  }

  async convertAsset(asset: UploadedAsset, options: ConversionOptions, outputPath: string) {
    const quality = this.resolveQuality(options.qualityMode);

    const transformer = sharp(asset.path, { failOn: "error" }).rotate();

    if (options.width || options.height) {
      transformer.resize({
        width: options.width,
        height: options.height,
        fit: "inside",
        withoutEnlargement: true
      });
    }

    if (options.preserveMetadata) {
      transformer.withMetadata();
    }

    switch (options.targetCodec) {
      case "jpeg":
      case "jpg": {
        transformer.jpeg({ quality, mozjpeg: true, progressive: true });
        break;
      }
      case "png": {
        transformer.png({ quality, compressionLevel: 9, effort: 8, adaptiveFiltering: true });
        break;
      }
      case "webp": {
        transformer.webp({ quality, effort: 6, smartSubsample: true });
        break;
      }
      case "avif": {
        transformer.avif({ quality, effort: 6, chromaSubsampling: "4:4:4" });
        break;
      }
      default: {
        throw new AppError("UNSUPPORTED_CODEC", `Unsupported target codec: ${options.targetCodec}`, 400);
      }
    }

    await transformer.toFile(outputPath);
    const metadata = await sharp(outputPath).metadata();

    return {
      width: metadata.width ?? null,
      height: metadata.height ?? null
    };
  }

  private resolveQuality(mode: ConversionOptions["qualityMode"]) {
    switch (mode) {
      case "size":
        return 60;
      case "quality":
        return 90;
      default:
        return 78;
    }
  }
}
