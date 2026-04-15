# System Patterns

## Architecture
- API layer: routes and transport concerns.
- Application layer: job orchestration and lifecycle.
- Domain layer: typed entities and status models.
- Infrastructure layer: storage, queue, and processing adapters.
- Shared layer: config, logging, envelopes, and errors.

## Runtime patterns
- Async queue with bounded concurrency.
- Stateless HTTP handlers.
- Job state transitions: uploaded -> queued -> processing -> completed/failed/expired.
- Central error mapping to stable API envelopes.

## Extensibility patterns
- Processor isolated from API logic.
- Storage isolated behind service abstraction.
- Queue isolated for later swap to worker backend.
