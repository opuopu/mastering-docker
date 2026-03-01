# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Docker-learning project featuring a Node.js/Express API server containerized with Docker. Demonstrates bind mounts, Docker volumes, and container file sync with nodemon.

## Architecture

- **index.js** — Express 5 API server with Winston logging. Routes: `/` (health), `/error` (triggers async error), `/logs` (lists log files). Errors are logged to timestamped files in `logs/`.
- **Dockerfile** — Node container using `nodemon --legacy-watch` for hot-reload inside Docker (required for bind mount file watching on Windows).
- **main.go / main.exe** — Unrelated Go playground file, not part of the Docker/Node app.

## Commands

### Build and run with Docker
```bash
docker build -t docker-app .
docker run -d -p 3000:3000 docker-app
```

### Run with bind mount + volume (dev mode)
```bash
docker run -d -p 3000:3000 \
  -v "//c/works/docker":/usr/src/app \
  -v "logs_volume:/usr/src/app/logs" \
  node:latest
```

### Run locally (without Docker)
```bash
npm install
npx nodemon index.js
```

Server runs on port 3000 (configurable via `PORT` env var).

## Key Details

- Uses `--legacy-watch` flag with nodemon because standard file watching doesn't work with Docker bind mounts on Windows.
- Error logs are written to `logs/` as individual timestamped JSON files, one per error.
- The `logs/` directory is excluded from Docker image via `.dockerignore` and is intended to be a Docker volume for persistence.
