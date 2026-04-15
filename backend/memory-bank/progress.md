# Progress

## Implemented
- Backend scaffold with disciplined folder structure.
- Upload endpoint with multipart handling and codec detection.
- Async conversion endpoint and bounded queue execution.
- Status endpoint with file and summary reporting.
- Download endpoint with single-file or zip delivery.
- Structured success/error envelopes and centralized error handling.
- TTL cleanup for temporary artifacts.
- Integration tests covering health, upload, convert, status, and download.
- Dockerfile and container runtime packaging.
- API versioning with /api/v1 route namespace.
- Optional legacy unversioned route compatibility.
- Optional API key auth and in-process rate-limit middleware.
- OpenAPI contract endpoint for machine-readable API docs.

## Pending
- Advanced metadata policy options.
- Stronger raw/heic workflow support.
- External queue and cloud storage adapters.
- Load/performance benchmarking and stress scenarios.
- OpenAPI/contract documentation and API version policy docs.
