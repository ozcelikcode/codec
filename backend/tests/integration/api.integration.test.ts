import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";

const API_PREFIX = "/api/v1";

describe("API integration", () => {
  let appInstance: Awaited<ReturnType<typeof buildApp>>["app"];
  let tempDir = "";

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "codec-backend-test-"));
    const built = await buildApp({
      tempDir,
      queueConcurrency: 1
    });

    appInstance = built.app;
    await appInstance.ready();
  });

  afterAll(async () => {
    if (appInstance) {
      await appInstance.close();
    }

    if (tempDir) {
      await removeDirectoryWithRetry(tempDir);
    }
  });

  it("returns versioned health status", async () => {
    const response = await request(appInstance.server).get(`${API_PREFIX}/health`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });

  it("keeps legacy health alias enabled", async () => {
    const response = await request(appInstance.server).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });

  it("serves OpenAPI contract on versioned route", async () => {
    const response = await request(appInstance.server).get(`${API_PREFIX}/openapi.json`);

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.1.0");
    expect(response.body.paths[`${API_PREFIX}/upload`]).toBeTruthy();
    expect(response.body.paths[`${API_PREFIX}/convert`]).toBeTruthy();
    expect(response.body.paths[`${API_PREFIX}/status/{id}`]).toBeTruthy();
    expect(response.body.paths[`${API_PREFIX}/download/{id}`]).toBeTruthy();
  });

  it("processes upload to download flow", async () => {
    const imageBuffer = await sharp({
      create: {
        width: 120,
        height: 120,
        channels: 3,
        background: { r: 220, g: 80, b: 80 }
      }
    })
      .png()
      .toBuffer();

    const uploadResponse = await request(appInstance.server)
      .post(`${API_PREFIX}/upload`)
      .attach("file", imageBuffer, {
        filename: "sample.png",
        contentType: "image/png"
      });

    expect(uploadResponse.status).toBe(201);
    expect(uploadResponse.body.success).toBe(true);

    const jobId = uploadResponse.body.data.jobId as string;
    expect(jobId).toBeTruthy();

    const convertResponse = await request(appInstance.server).post(`${API_PREFIX}/convert`).send({
      jobId,
      targetCodec: "webp",
      width: 100,
      qualityMode: "balanced",
      preserveMetadata: false
    });

    expect(convertResponse.status).toBe(202);
    expect(convertResponse.body.success).toBe(true);

    const statusResponse = await waitForTerminalStatus(appInstance.server, API_PREFIX, jobId);
    expect(statusResponse.body.success).toBe(true);
    expect(statusResponse.body.data.status).toBe("completed");

    const downloadResponse = await request(appInstance.server).get(`${API_PREFIX}/download/${jobId}`);
    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.headers["content-disposition"]).toContain("attachment;");
    expect(downloadResponse.headers["content-type"]).toContain("application/octet-stream");
    expect(downloadResponse.body.length).toBeGreaterThan(0);
  });

  it("returns not found for unknown status id", async () => {
    const response = await request(appInstance.server).get(
      `${API_PREFIX}/status/00000000-0000-4000-8000-000000000000`
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
});

const waitForTerminalStatus = async (server: Parameters<typeof request>[0], apiPrefix: string, jobId: string) => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const response = await request(server).get(`${apiPrefix}/status/${jobId}`);
    const status = response.body?.data?.status as string | undefined;

    if (status === "completed" || status === "failed") {
      return response;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`Job ${jobId} did not reach terminal status in time`);
};

const removeDirectoryWithRetry = async (targetPath: string) => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rm(targetPath, { recursive: true, force: true });
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EBUSY" && code !== "ENOTEMPTY") {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 75));
    }
  }
};
