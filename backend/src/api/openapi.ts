interface OpenApiOptions {
  apiPrefix: string;
  includeLegacyRoutes: boolean;
}

export const buildOpenApiDocument = ({ apiPrefix, includeLegacyRoutes }: OpenApiOptions) => {
  const versionedBase = apiPrefix === "/" ? "" : apiPrefix;
  const paths = {
    [`${versionedBase}/health`]: {
      get: {
        summary: "Health check",
        tags: ["system"],
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse"
                }
              }
            }
          }
        }
      }
    },
    [`${versionedBase}/upload`]: {
      post: {
        summary: "Upload source image files",
        tags: ["conversion"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "Single file per field; repeat field for multiple uploads"
                  }
                },
                required: ["file"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Upload accepted and job initialized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UploadResponse"
                }
              }
            }
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    },
    [`${versionedBase}/convert`]: {
      post: {
        summary: "Start asynchronous conversion",
        tags: ["conversion"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ConvertRequest"
              }
            }
          }
        },
        responses: {
          "202": {
            description: "Job accepted for conversion",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ConvertResponse"
                }
              }
            }
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    },
    [`${versionedBase}/status/{id}`]: {
      get: {
        summary: "Get conversion job status",
        tags: ["conversion"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            }
          }
        ],
        responses: {
          "200": {
            description: "Job status payload",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StatusResponse"
                }
              }
            }
          },
          "404": {
            description: "Job not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    },
    [`${versionedBase}/download/{id}`]: {
      get: {
        summary: "Download converted output",
        tags: ["conversion"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid"
            }
          }
        ],
        responses: {
          "200": {
            description: "Binary file (single output) or zip archive (batch)",
            content: {
              "application/octet-stream": {
                schema: {
                  type: "string",
                  format: "binary"
                }
              },
              "application/zip": {
                schema: {
                  type: "string",
                  format: "binary"
                }
              }
            }
          },
          "409": {
            description: "Job is not completed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    }
  } as const;

  return {
    openapi: "3.1.0",
    info: {
      title: "Codec Backend API",
      version: "1.0.0",
      description: "Image upload, conversion, status polling, and download service."
    },
    servers: [
      {
        url: versionedBase || "/",
        description: "Versioned API base"
      }
    ],
    tags: [
      {
        name: "system",
        description: "Operational endpoints"
      },
      {
        name: "conversion",
        description: "Image conversion workflow"
      }
    ],
    paths,
    components: {
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", const: true },
            data: {
              type: "object",
              properties: {
                status: { type: "string", const: "ok" }
              },
              required: ["status"]
            },
            traceId: { type: "string" }
          },
          required: ["success", "data", "traceId"]
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", const: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: {}
              },
              required: ["code", "message"]
            },
            traceId: { type: "string" }
          },
          required: ["success", "error", "traceId"]
        },
        ConvertRequest: {
          type: "object",
          properties: {
            jobId: { type: "string", format: "uuid" },
            targetCodec: {
              type: "string",
              enum: ["jpeg", "jpg", "png", "webp", "avif"]
            },
            width: { type: "integer", minimum: 1, maximum: 10000 },
            height: { type: "integer", minimum: 1, maximum: 10000 },
            qualityMode: {
              type: "string",
              enum: ["balanced", "quality", "size"]
            },
            preserveMetadata: { type: "boolean" }
          },
          required: ["jobId", "targetCodec"]
        },
        UploadResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", const: true },
            data: {
              type: "object",
              properties: {
                jobId: { type: "string", format: "uuid" },
                status: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                expiresAt: { type: "string", format: "date-time" },
                files: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      assetId: { type: "string", format: "uuid" },
                      fileName: { type: "string" },
                      codec: { type: "string" },
                      sizeBytes: { type: "integer" },
                      width: { type: ["integer", "null"] },
                      height: { type: ["integer", "null"] }
                    },
                    required: ["assetId", "fileName", "codec", "sizeBytes", "width", "height"]
                  }
                }
              },
              required: ["jobId", "status", "createdAt", "expiresAt", "files"]
            },
            traceId: { type: "string" }
          },
          required: ["success", "data", "traceId"]
        },
        ConvertResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", const: true },
            data: {
              type: "object",
              properties: {
                jobId: { type: "string", format: "uuid" },
                status: { type: "string" },
                conversionOptions: {
                  type: "object",
                  properties: {
                    targetCodec: { type: "string" },
                    width: { type: ["integer", "null"] },
                    height: { type: ["integer", "null"] },
                    qualityMode: { type: "string" },
                    preserveMetadata: { type: "boolean" }
                  },
                  required: ["targetCodec", "qualityMode", "preserveMetadata"]
                },
                updatedAt: { type: "string", format: "date-time" }
              },
              required: ["jobId", "status", "conversionOptions", "updatedAt"]
            },
            traceId: { type: "string" }
          },
          required: ["success", "data", "traceId"]
        },
        StatusResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", const: true },
            data: {
              type: "object",
              properties: {
                jobId: { type: "string", format: "uuid" },
                status: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                expiresAt: { type: "string", format: "date-time" },
                conversionOptions: { type: ["object", "null"] },
                summary: { type: ["object", "null"] },
                errorMessage: { type: ["string", "null"] },
                files: {
                  type: "array",
                  items: { type: "object" }
                }
              },
              required: [
                "jobId",
                "status",
                "createdAt",
                "updatedAt",
                "expiresAt",
                "conversionOptions",
                "summary",
                "files"
              ]
            },
            traceId: { type: "string" }
          },
          required: ["success", "data", "traceId"]
        }
      }
    },
    "x-legacyRoutesEnabled": includeLegacyRoutes
  };
};
