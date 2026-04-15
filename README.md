# codec

This repository contains frontend prototypes and a production-oriented backend implementation for image codec conversion.

## Workspace Layout

- `frontend/` : static UI prototypes for upload, settings, and success flows
- `backend/` : Fastify + TypeScript backend implementation
- `prompt.md` : original system requirements prompt

## Backend Quick Start

```bash
cd backend
npm install
npm run dev
```

Server default: `http://localhost:8080`

## API Flow

1. `POST /upload` (multipart files)
2. `POST /convert` (jobId + target options)
3. `GET /status/:id` (poll)
4. `GET /download/:id` (single file or zip)

