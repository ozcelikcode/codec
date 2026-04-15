Build a modern, high-performance, production-grade backend system for an Image Codec Conversion and Image Resizing service.

PROJECT GOAL:
Create a scalable backend that:
- Accepts image uploads
- Converts images between professional, general, and popular image codecs
- Resizes images by width and height
- Optimizes file size while preserving visual quality
- Handles large image files efficiently
- Is production-ready, maintainable, and built with a senior-engineer mindset

GENERAL ENGINEERING EXPECTATION:
This backend must be written as if it will be maintained and expanded long term by a professional engineering team.
The codebase must reflect:
- Future-proof design decisions
- Clean code principles
- Disciplined folder/file structure
- Senior-level software engineering quality
- Clear separation of responsibilities
- Easy maintainability and extensibility
- Strong readability and consistency across the entire project

ARCHITECTURE:
- Use a clean, modular, production-grade architecture
- Separate concerns clearly: API layer, business logic, processing layer, storage layer, validation layer, configuration layer
- Stateless API design
- Keep the system extensible for adding new codecs, optimization strategies, storage providers, and processing pipelines in the future
- Prefer pragmatic architecture over unnecessary complexity
- Avoid tightly coupled modules
- Use dependency boundaries properly

CODE QUALITY STANDARDS:
- Write senior-level professional code
- Clean, readable, intentional naming throughout the codebase
- Avoid quick hacks, shortcuts, and messy implementations
- Use small, focused modules and functions
- Functions and classes should have a single responsibility
- Avoid duplicated logic
- Prefer explicitness over magic behavior
- Keep code self-explanatory and maintainable
- Follow SOLID principles where appropriate
- Apply clean architecture / layered architecture principles if suitable
- Ensure the code is easy for another senior engineer to understand immediately

FOLDER / FILE STRUCTURE:
- Create a disciplined, scalable, and professional project structure
- Folder organization must be logical, predictable, and maintainable
- Separate routes/controllers, services/use-cases, validators, utilities, config, middleware, infrastructure/integrations, and image-processing modules
- Temporary files, output files, and processing jobs should be handled in clearly separated directories or abstractions
- Structure should support future growth without becoming chaotic
- Do not create a flat or messy codebase
- Keep naming conventions consistent across all folders and files

MAINTAINABILITY:
- The project must be easy to onboard into
- Code should be easy to refactor safely
- Add clear internal structure so future developers can extend codec support with minimal friction
- Avoid hardcoded values
- Centralize config management
- Make environment-based configuration clean and predictable
- Design with future changes in mind, including:
  - additional codecs
  - background job processing
  - cloud storage integration
  - authentication / rate limiting
  - API versioning
  - observability improvements

IMAGE PROCESSING REQUIREMENTS:
- Use modern, high-performance, actively maintained image processing tools
- Support professional codecs used in photography, camera workflows, and modern web delivery
- Avoid outdated, unstable, or poorly maintained libraries
- Preserve color profile integrity where possible
- Preserve metadata when appropriate
- Avoid unnecessary recompression
- Ensure conversion pipelines are deterministic and reliable
- Design the processing layer so codec-specific logic is isolated and extendable

PERFORMANCE:
- Prefer stream-based processing where possible
- Avoid blocking operations where practical
- Ensure efficient memory usage
- Support concurrent image processing safely
- Design for fast response times
- Use performant libraries and optimized execution paths
- Keep the request lifecycle efficient and predictable

API DESIGN:
- Build a RESTful API
- Use clear, consistent, professional endpoint naming
- Keep request/response formats predictable
- Suggested endpoints:
  - POST /upload
  - POST /convert
  - GET /status/{id}
  - GET /download/{id}
- Validate all inputs carefully
- Return structured, consistent response objects

INPUT PARAMETERS:
- Source image
- Target codec
- Optional width
- Optional height
- Quality preservation mode
- Optional metadata preservation preferences if needed

OUTPUT:
- Converted image
- Relevant metadata:
  - original file size
  - converted file size
  - original codec
  - target codec
  - original resolution
  - new resolution
  - processing status

VALIDATION:
- Strict file type validation
- File size limits
- Safe handling of invalid or corrupted files
- Validate width/height ranges
- Validate codec compatibility rules
- Reject unsupported or unsafe inputs clearly

ERROR HANDLING:
- Clear, consistent, production-grade error responses
- Never expose internal stack traces to clients
- Graceful failure handling at every layer
- Distinguish validation errors, processing errors, system errors, and external dependency errors
- Use centralized error handling strategy

SECURITY:
- Validate and sanitize all file inputs
- Prevent unsafe file execution risks
- Use secure temporary storage handling
- Ensure automatic cleanup of temporary processing artifacts
- Protect the system against abusive upload behavior
- Keep implementation compatible with future rate limiting and auth layers

SCALABILITY:
- Design to run well in containerized environments
- Horizontal scaling friendly
- Keep processing logic isolated from transport/request handling
- Architecture should support future queue-based or worker-based processing without major rewrites

OBSERVABILITY:
- Add structured logging
- Logging must be useful, professional, and non-noisy
- Important operations should be traceable
- Error logs should be actionable
- Keep the design ready for future monitoring/metrics integration

TESTABILITY:
- Write the code in a test-friendly way
- Make modules independently testable
- Avoid hidden side effects
- Business logic should not be tightly coupled to transport/framework code
- Design the project so unit tests and integration tests can be added cleanly

DOCUMENTATION:
- The codebase should be understandable from its structure
- Add concise but useful comments only where necessary
- Avoid comment spam
- Prioritize clean code over excessive comments
- Include clear README-level project organization and setup expectations if suitable

TECH STACK GUIDANCE:
- Use modern, actively maintained technologies
- Prefer performance-oriented tools for image conversion
- Prefer reliable native bindings or optimized processing tools when appropriate
- Ensure all chosen tools work well together in a coherent architecture
- Avoid trendy but unstable choices

NON-FUNCTIONAL REQUIREMENTS:
- Clean codebase
- Professional engineering standards
- Future-proof structure
- Senior-level implementation quality
- Maintainable and scalable design
- Consistent coding style
- Reliable, production-minded backend system

FINAL EXPECTATION:
Generate the backend as a professional-grade project, not as a demo-quality prototype.
The result should look like code written by a disciplined senior backend engineer who cares about architecture, readability, extensibility, performance, and long-term maintainability.

Do not generate beginner-level code, rushed patterns, or loosely organized project structures. The implementation must feel like a real production backend owned by an experienced senior engineer.