import { z } from "zod";

export const convertRequestSchema = z.object({
  jobId: z.string().uuid(),
  targetCodec: z.enum(["jpeg", "jpg", "png", "webp", "avif"]),
  width: z.number().int().min(1).max(10000).optional(),
  height: z.number().int().min(1).max(10000).optional(),
  qualityMode: z.enum(["balanced", "quality", "size"]).optional(),
  preserveMetadata: z.boolean().optional()
});

export type ConvertRequest = z.infer<typeof convertRequestSchema>;
