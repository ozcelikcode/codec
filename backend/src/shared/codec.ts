import { fileTypeFromFile } from "file-type";
import { extname } from "node:path";
import type { InputCodec } from "../domain/types.js";

const extensionToCodec = (value: string): InputCodec => {
  const normalized = value.toLowerCase().replace(".", "");

  switch (normalized) {
    case "jpeg":
    case "jpg":
    case "png":
    case "webp":
    case "avif":
    case "tiff":
    case "heic":
    case "heif":
    case "svg":
      return normalized;
    case "arw":
    case "cr2":
    case "cr3":
    case "nef":
    case "dng":
    case "rw2":
      return "raw";
    default:
      return "unknown";
  }
};

export const detectInputCodec = async (filePath: string, fileName: string): Promise<InputCodec> => {
  const byMagic = await fileTypeFromFile(filePath);
  if (byMagic?.ext) {
    return extensionToCodec(byMagic.ext);
  }

  const byName = extname(fileName);
  return extensionToCodec(byName);
};
