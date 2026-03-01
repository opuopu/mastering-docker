# Docker Node.js API Server

A Docker-learning project featuring a Node.js/Express 5 API server containerized with Docker. It demonstrates bind mounts for live code syncing, Docker volumes for persistent log storage, and hot-reload with nodemon inside a container.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Node.js](https://nodejs.org/) (v18+ recommended) -- only needed if running outside Docker

## Project Structure

```
.
├── index.js          # Express 5 API server with Winston error logging
├── Dockerfile        # Container image definition (nodemon + legacy-watch)
├── package.json      # Dependencies: express 5, winston, nodemon
├── .dockerignore     # Excludes node_modules, logs, .git, etc. from build context
├── bindMount.md      # Quick-reference cheat sheet for Docker bind mount/volume commands
└── logs/             # Auto-created directory for timestamped error log files
```

## API Endpoints

| Method | Path     | Description                                                                 |
|--------|----------|-----------------------------------------------------------------------------|
| GET    | `/`      | Health check. Returns `{ "messgae": "its workings" }`.                      |
| GET    | `/error` | Triggers an intentional async error after 500 ms (for testing the logger).  |
| GET    | `/logs`  | Lists all `.log` files in the `logs/` directory with a count.               |

## Getting Started

### Run locally (without Docker)

```bash
npm install
npx nodemon index.js
```

The server starts on `http://localhost:3000` by default.

### Run with Docker

#### 1. Build the image

```bash
docker build -t docker-node-app .
```

#### 2. Run the container

Basic run (no host syncing):

```bash
docker run -d -p 3000:3000 --name node-api docker-node-app
```

#### 3. Run with bind mount + volume

This is the recommended setup for development. It bind-mounts your project directory into the container so code changes are reflected immediately, and uses a named Docker volume for the `logs/` directory so log files persist across container restarts.

```bash
docker run -d -p 3000:3000 \
  -v "//c/works/docker":/usr/src/app \
  -v logs_volume:/usr/src/app/logs \
  --name node-api \
  docker-node-app
```

> Adjust the host path (`//c/works/docker`) to match your local project directory. On Windows with Git Bash or MSYS2, use the `//c/...` prefix. In PowerShell, use `C:\works\docker`.

#### Useful volume commands

```bash
docker volume create logs_volume      # Create the named volume
docker volume ls                      # List all volumes
docker volume inspect logs_volume     # Inspect volume details
docker volume rm logs_volume          # Remove the volume
```

## Why `--legacy-watch`?

The Dockerfile runs nodemon with the `--legacy-watch` flag:

```dockerfile
CMD ["npx", "nodemon", "--legacy-watch", "index.js"]
```

Nodemon relies on filesystem events (`inotify` on Linux) to detect file changes. When the project directory is bind-mounted from a Windows or macOS host into a Linux container, native filesystem events are **not forwarded** across the mount boundary. The `--legacy-watch` flag tells nodemon to fall back to polling, which works reliably regardless of the host OS. Without it, nodemon will not detect any file changes made on the host.

## Logging

Error logging is handled by [Winston](https://github.com/winstonjs/winston).

- When an unhandled error reaches the global Express error handler, a **new log file** is created with a timestamped name (e.g., `error-2026-03-01T12-00-00.000Z.log`).
- Each log file contains a JSON entry with the error message, stack trace, HTTP method, and request URL.
- Errors are also printed to the console via a separate Winston console transport.
- The `logs/` directory is created automatically on startup if it does not exist.
- The `/logs` endpoint returns a JSON list of all `.log` files and their count.

If you are running with a Docker volume mounted at `/usr/src/app/logs`, log files will persist even after the container is removed.

## Environment Variables

| Variable | Default | Description                          |
|----------|---------|--------------------------------------|
| `PORT`   | `3000`  | The port the Express server binds to |

Override it when running the container:

```bash
docker run -d -p 4000:4000 -e PORT=4000 docker-node-app
```
