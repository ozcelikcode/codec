# Tech Context

## Stack
- Node.js 20+
- TypeScript
- Fastify ecosystem (multipart, helmet, cors)
- Sharp/libvips for image operations
- Zod for payload validation
- Pino for structured logging

## Constraints
- v1 uses local ephemeral filesystem.
- v1 queue is in-process memory queue.
- v1 codec output set focuses on modern/popular formats.

## Operational defaults
- Env-driven file count and size limits.
- Retention TTL cleanup loop.
- Correlation-friendly request IDs via Fastify.
