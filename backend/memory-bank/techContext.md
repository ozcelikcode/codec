# Tech Context

## Stack
- Node.js 20+
- TypeScript
- Fastify ecosystem (multipart, helmet, cors)
- Sharp/libvips for image operations
- Zod for payload validation
- Pino for structured logging
- Vitest + Supertest for automated API integration tests
- Docker multi-stage image for deployment

## Constraints
- v1 uses local ephemeral filesystem.
- v1 queue is in-process memory queue.
- v1 codec output set focuses on modern/popular formats.

## Operational defaults
- Env-driven file count and size limits.
- Retention TTL cleanup loop.
- Correlation-friendly request IDs via Fastify.
- API version prefix defaults to /api/v1 with configurable legacy aliases.
- API key auth and rate-limit middleware are feature-flagged via env.
