# Codec Backend

Production-grade backend for image codec conversion and resizing.

## Stack

- Node.js + TypeScript
- Fastify
- Sharp (libvips)
- In-memory async queue (v1)
- Local ephemeral storage (v1)

## Endpoints

- `POST /upload` : multipart file upload, returns job metadata
- `POST /convert` : start async conversion for an uploaded job
- `GET /status/:id` : poll job status
- `GET /download/:id` : download converted file (single) or zip (batch)
- `GET /health` : health check

## Environment

Copy `.env.example` to `.env` and tune limits as needed.

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

## Current Scope

- Implemented output codecs: jpeg/jpg, png, webp, avif
- Async processing with bounded concurrency
- Strict upload limits and codec validation
- Structured response envelopes and centralized error handling
- TTL-based artifact cleanup

## Planned Next Iterations

- Queue backend abstraction with Redis/BullMQ
- Cloud object storage provider
- Extended professional codec support (HEIC and RAW workflows)
- Auth and rate limiting layers
- Comprehensive integration test suite with fixtures
