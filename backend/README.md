# Codec Backend

Production-grade backend for image codec conversion and resizing.

## Stack

- Node.js + TypeScript
- Fastify
- Sharp (libvips)
- In-memory async queue (v1)
- Local ephemeral storage (v1)

## Endpoints

- Primary versioned routes: `/api/v1/*`
- `POST /api/v1/upload` : multipart file upload, returns job metadata
- `POST /api/v1/convert` : start async conversion for an uploaded job
- `GET /api/v1/status/:id` : poll job status
- `GET /api/v1/download/:id` : download converted file (single) or zip (batch)
- `GET /api/v1/health` : health check
- Legacy unversioned aliases can remain enabled via env for compatibility.

Contract discovery:

- GET /api/v1/openapi.json
- Optional legacy alias: GET /openapi.json when legacy routes are enabled

## Environment

Copy `.env.example` to `.env` and tune limits as needed.

Key toggles:

- `API_PREFIX` default `/api/v1`
- `LEGACY_UNVERSIONED_ROUTES_ENABLED` default `true`
- `ENABLE_API_KEY_AUTH` default `false` (expects `x-api-key`)
- `ENABLE_RATE_LIMIT` default `false`

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Test

```bash
npm run test:run
```

Integration tests exercise:

- health check
- upload and async conversion flow
- status polling to terminal state
- download endpoint behavior

## Docker

```bash
docker build -t codec-backend .
docker run --rm -p 8080:8080 codec-backend
```

## Current Scope

- Implemented output codecs: jpeg/jpg, png, webp, avif
- Async processing with bounded concurrency
- Strict upload limits and codec validation
- Structured response envelopes and centralized error handling
- TTL-based artifact cleanup
- Integration tests for core API flow
- Multi-stage Docker image for production runtime
- API versioning with optional legacy route compatibility
- Optional API key auth and in-process rate-limit middleware scaffold

## Planned Next Iterations

- Queue backend abstraction with Redis/BullMQ
- Cloud object storage provider
- Extended professional codec support (HEIC and RAW workflows)
- Auth and rate limiting layers
- Load/performance tests and benchmark suite
