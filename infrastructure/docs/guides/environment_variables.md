# Environmental Variables Guide for BookReview Platform

This document outlines the environmental variables used throughout the BookReview Platform application, both for frontend and backend services, as well as infrastructure configuration.

## Overview

The BookReview Platform uses environmental variables to configure different aspects of the application and infrastructure. This approach allows for consistent configuration across environments without hardcoding sensitive information or environment-specific settings.

## Frontend Environmental Variables

These variables are used in the Next.js frontend application.

### Core Configuration

| Variable Name | Description | Example Value | Required |
|---------------|-------------|--------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `https://api.bookreview.com` or `http://localhost:3001` | Yes |
| `NEXT_PUBLIC_APP_ENV` | Current environment | `development`, `staging`, `production` | Yes |
| `NEXT_PUBLIC_SITE_NAME` | Name of the site | `BookReview Platform` | Yes |

### Authentication

| Variable Name | Description | Example Value | Required |
|---------------|-------------|--------------|----------|
| `NEXT_PUBLIC_AUTH_PROVIDER` | Authentication provider | `local`, `google`, `facebook` | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789-abc.apps.googleusercontent.com` | For Google Auth |
| `NEXT_PUBLIC_FB_APP_ID` | Facebook App ID | `123456789012345` | For Facebook Auth |

### Feature Flags

| Variable Name | Description | Example Value | Required |
|---------------|-------------|--------------|----------|
| `NEXT_PUBLIC_ENABLE_REVIEWS` | Enable review functionality | `true` | No (default: true) |
| `NEXT_PUBLIC_ENABLE_RECOMMENDATIONS` | Enable book recommendations | `true` | No (default: true) |

## Backend Environmental Variables

These variables are used in the Express.js backend application.

### Core Configuration

| Variable Name | Description | Example Value | Required |
|---------------|-------------|--------------|----------|
| `NODE_ENV` | Node environment | `development`, `production` | Yes |
| `PORT` | Server port | `3001` | Yes |
| `HOST` | Server host | `0.0.0.0` | Yes |
| `API_VERSION` | API version | `v1` | Yes |
| `CORS_ORIGIN` | CORS allowed origins | `http://localhost:3000` or `*` | Yes |

### Authentication

| Variable Name | Description | Example Value | Required |
|---------------|-------------|--------------|----------|
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` | Yes |
| `JWT_EXPIRATION` | JWT expiration time | `24h` | Yes |
| `JWT_REFRESH_EXPIRATION` | JWT refresh token expiration | `7d` | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789-abc.apps.googleusercontent.com` | For Google Auth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `your-client-secret` | For Google Auth |
| `FB_APP_ID` | Facebook App ID | `123456789012345` | For Facebook Auth |
| `FB_APP_SECRET` | Facebook App Secret | `your-app-secret` | For Facebook Auth |

### Storage and Data

| Variable Name | Description | Example Value | Required |
|---------------|-------------|--------------|----------|
| `DATA_STORAGE_TYPE` | Type of data storage | `file`, `database` | Yes |
| `DATA_DIRECTORY` | Directory for file storage | `/app/data` | For file storage |
| `DB_HOST` | Database host | `localhost` | For database storage |
| `DB_PORT` | Database port | `5432` | For database storage |
| `DB_NAME` | Database name | `bookreview` | For database storage |
| `DB_USER` | Database user | `dbuser` | For database storage |
| `DB_PASSWORD` | Database password | `password123` | For database storage |
| `DB_SSL` | Database SSL mode | `true` | For database storage |

### Logging

| Variable Name | Description | Example Value | Required |
|---------------|-------------|--------------|----------|
| `LOG_LEVEL` | Logging level | `info`, `debug`, `error` | Yes |
| `LOG_FORMAT` | Logging format | `json`, `text` | No (default: json) |

## Infrastructure Environmental Variables

These variables are used in Terraform and Docker configuration.

### Terraform Variables

| Variable Name | Description | Example Value |
|---------------|-------------|--------------|
| `TF_VAR_environment` | Deployment environment | `dev`, `staging`, `production` |
| `TF_VAR_aws_region` | AWS region | `us-east-1` |
| `TF_VAR_vpc_cidr` | VPC CIDR block | `10.0.0.0/16` |
| `TF_VAR_instance_type` | EC2 instance type | `t3.micro` |
| `TF_VAR_key_name` | SSH key name | `bookreview-key` |
| `AWS_ACCESS_KEY_ID` | AWS access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

### Docker Compose Variables

| Variable Name | Description | Example Value |
|---------------|-------------|--------------|
| `COMPOSE_PROJECT_NAME` | Docker Compose project name | `bookreview` |
| `FRONTEND_PORT` | Frontend exposed port | `3000` |
| `BACKEND_PORT` | Backend exposed port | `3001` |
| `FRONTEND_IMAGE_TAG` | Frontend image tag | `latest` |
| `BACKEND_IMAGE_TAG` | Backend image tag | `latest` |

## Managing Environmental Variables

### Local Development

For local development, create `.env.local` files:

1. Frontend (in the frontend directory):
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
   NEXT_PUBLIC_APP_ENV=development
   NEXT_PUBLIC_SITE_NAME=BookReview Platform
   ```

2. Backend (in the backend directory):
   ```
   NODE_ENV=development
   PORT=3001
   HOST=0.0.0.0
   API_VERSION=v1
   CORS_ORIGIN=http://localhost:3000
   JWT_SECRET=local-development-secret
   JWT_EXPIRATION=24h
   DATA_STORAGE_TYPE=file
   DATA_DIRECTORY=./data
   LOG_LEVEL=debug
   ```

### Docker Environment

When using Docker, set environment variables in the docker-compose.yml file:

```yaml
services:
  frontend:
    # ...
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
      - NEXT_PUBLIC_APP_ENV=development
      # ...
  
  backend:
    # ...
    environment:
      - NODE_ENV=development
      - PORT=3001
      # ...
```

### Production Deployment

For production deployments, use the appropriate methods for your hosting environment:

1. **AWS EC2**: Use EC2 User Data or Systems Manager Parameter Store
2. **AWS ECS**: Use ECS Task Definitions to define environment variables
3. **CI/CD Pipeline**: Set environment variables in your CI/CD configuration

## Security Best Practices

1. **Never commit .env files to version control**
   - Add `.env*` to your .gitignore file
   - Use .env.example files as templates

2. **Use secrets management for sensitive values**
   - AWS Secrets Manager
   - HashiCorp Vault
   - GitHub Secrets for CI/CD

3. **Rotate sensitive credentials regularly**
   - JWT secrets
   - API keys
   - Database credentials

4. **Limit environment variable exposure**
   - Only expose what each service needs
   - Use NEXT_PUBLIC_ prefix intentionally in Next.js

## Troubleshooting

Common issues related to environment variables:

1. **Frontend can't connect to backend**
   - Check `NEXT_PUBLIC_API_BASE_URL` is correct
   - Verify CORS settings in backend

2. **Authentication failures**
   - Verify JWT_SECRET is properly set
   - Check expiration times

3. **Missing environment variables**
   - Look for "process.env.VARIABLE_NAME is undefined" errors
   - Ensure all required variables are set

4. **Environment-specific bugs**
   - Compare environment variables across environments
   - Check for environment-specific configurations
