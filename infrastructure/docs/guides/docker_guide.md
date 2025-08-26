# Docker Configuration Guide for BookReview Platform

This document explains the Docker configuration for the BookReview Platform, including the Dockerfiles for frontend and backend services and the docker-compose setup for local development.

## Overview

The BookReview Platform uses Docker to containerize both frontend and backend components. This approach ensures consistency across different environments and simplifies deployment.

## Directory Structure

```
infrastructure/docker/
├── frontend/
│   └── Dockerfile       # Frontend Docker configuration
├── backend/
│   └── Dockerfile       # Backend Docker configuration
└── docker-compose.yml   # Local development configuration
```

## Frontend Docker Configuration

The frontend Dockerfile uses a multi-stage build approach to optimize the image size:

### Stage 1: Build
- Uses Node.js to build the Next.js application
- Installs all dependencies needed for building
- Creates a production build of the application

### Stage 2: Production
- Uses Nginx as a lightweight web server
- Copies only the built assets from the previous stage
- Configures Nginx to serve the static content

### Key Features
- Optimized image size by excluding development dependencies
- Production-ready Nginx configuration
- Built-in health checks
- Proper caching configuration for static assets

## Backend Docker Configuration

The backend Dockerfile also uses a multi-stage build:

### Stage 1: Build
- Uses Node.js to transpile TypeScript code
- Installs all dependencies needed for building
- Creates a production build of the application

### Stage 2: Production
- Uses a minimal Node.js runtime
- Installs only production dependencies
- Copies only necessary files from the build stage

### Key Features
- Proper handling of Node.js environment variables
- Created with security in mind (non-root user)
- Volume mounting for persistent data
- Optimized for minimal size and startup time

## Docker Compose Configuration

The docker-compose.yml file orchestrates local development:

### Services
1. **Frontend**:
   - Builds using the frontend Dockerfile
   - Maps port 3000 to container port 80
   - Connects to the backend service
   - Configured with development environment variables

2. **Backend**:
   - Builds using the backend Dockerfile
   - Maps port 3001 to container port 3001
   - Mounts local data directory for file-based storage
   - Configured with development environment variables

### Network Configuration
- Creates a dedicated network for inter-service communication
- Ensures proper DNS resolution between services

## Using Docker in Development

To run the application locally with Docker:

1. **Build and start the services**:
   ```bash
   cd infrastructure/docker
   docker-compose up --build
   ```

2. **Access the applications**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/v1

3. **View logs**:
   ```bash
   docker-compose logs -f [service-name]
   ```

4. **Stop the services**:
   ```bash
   docker-compose down
   ```

## Using Docker in Production

For production deployment:

1. **Build the images**:
   ```bash
   docker build -t bookreview/frontend:latest -f infrastructure/docker/frontend/Dockerfile ./frontend
   docker build -t bookreview/backend:latest -f infrastructure/docker/backend/Dockerfile ./backend
   ```

2. **Push to registry**:
   ```bash
   docker push bookreview/frontend:latest
   docker push bookreview/backend:latest
   ```

3. The images are then pulled and deployed by the infrastructure setup in AWS.

## Best Practices Implemented

1. **Security**:
   - No sensitive data in images
   - Minimal base images
   - Latest security patches

2. **Efficiency**:
   - Multi-stage builds
   - Layer caching optimization
   - Minimal dependencies

3. **Operability**:
   - Health checks
   - Proper logging configuration
   - Environment variable management

## Troubleshooting

Common issues and solutions:

1. **Container fails to start**:
   - Check logs: `docker logs [container-id]`
   - Verify environment variables
   - Ensure ports are not already in use

2. **Services can't communicate**:
   - Verify network configuration
   - Check service names are correctly referenced
   - Ensure ports are correctly mapped

3. **Volume mounting issues**:
   - Verify paths are correct
   - Check file permissions
   - Ensure directory exists on host
