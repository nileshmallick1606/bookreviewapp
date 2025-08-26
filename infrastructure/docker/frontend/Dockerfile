# Frontend Dockerfile for BookReview Platform
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
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
