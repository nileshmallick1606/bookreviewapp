# Backend Dockerfile for BookReview Platform
# This is a multi-stage build to optimize the image size

# Stage 1: Build the application
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:16-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy built code from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create data directory
RUN mkdir -p /app/data

# Expose the API port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/app.js"]
