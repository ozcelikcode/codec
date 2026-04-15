# Active Context

## Current implementation focus
Backend foundation and first working API slice are implemented:
- Core layered structure.
- Upload/convert/status/download endpoints.
- In-memory queue and local storage lifecycle.
- Sharp-based conversion pipeline.
- Vitest integration test harness for API lifecycle.
- Multi-stage Docker build for production runtime.
- API versioned route surface under /api/v1 with legacy aliases.
- Optional API key and in-process rate-limit middleware scaffold.

## Immediate next steps
- Tighten codec capability matrix and fallback behavior.
- Add stricter DTO docs and OpenAPI specification.
- Introduce queue/storage adapter interfaces for external systems.
- Add dedicated load/performance benchmarks.
