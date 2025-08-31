# BookReview Platform Installation Guide

**Version:** 1.0  
**Date:** August 31, 2025  
**Author:** DevOps Team

This guide provides detailed instructions for installing, configuring, and deploying the BookReview platform in various environments.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Local Development Setup](#local-development-setup)
3. [Production Environment Setup](#production-environment-setup)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [External API Integration](#external-api-integration)
9. [Security Configurations](#security-configurations)
10. [Testing Installation](#testing-installation)
11. [Troubleshooting](#troubleshooting)

## System Requirements

### Development Environment

- **Node.js**: v16.x or later
- **npm**: v8.x or later
- **Git**: v2.30 or later
- **Memory**: Minimum 8GB RAM
- **Disk Space**: At least 1GB free space
- **OS**: Windows 10/11, macOS 12+, or Linux (Ubuntu 20.04+)

### Production Environment

- **Node.js**: v16.x LTS
- **Memory**: Minimum 16GB RAM (recommended)
- **CPU**: 4+ cores recommended
- **Disk Space**: At least 10GB free space (SSD recommended)
- **OS**: Ubuntu Server 20.04 LTS (recommended)

### Required Software

- **Docker**: v20.10 or later (for containerized deployment)
- **Docker Compose**: v2.0 or later
- **Nginx**: v1.18 or later (for production deployments)
- **OpenSSL**: Latest version for SSL certificate generation

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/organization/bookreview-platform.git
cd bookreview-platform
```

### Step 2: Set Up Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local` to configure local development settings:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Set Up Backend

```bash
cd ../backend
npm install
cp .env.example .env
```

Edit `.env` to configure local development settings:

```
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_for_dev
OPENAI_API_KEY=your_openai_api_key
```

### Step 4: Initialize Data

```bash
npm run seed
```

This will create sample data in the `backend/data` directory.

### Step 5: Start Development Servers

In separate terminal windows:

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1

## Production Environment Setup

### Step 1: Prepare the Server

Update and install required packages:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git build-essential
```

### Step 2: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:

```bash
node -v  # Should show v16.x.x
npm -v   # Should show v8.x.x
```

### Step 3: Install PM2 Process Manager

```bash
sudo npm install -g pm2
```

### Step 4: Clone and Configure the Application

```bash
git clone https://github.com/organization/bookreview-platform.git
cd bookreview-platform
```

### Step 5: Setup Backend

```bash
cd backend
npm ci --production
cp .env.example .env
```

Edit `.env` for production settings:

```
PORT=3001
NODE_ENV=production
JWT_SECRET=your_secure_random_string
OPENAI_API_KEY=your_openai_api_key
```

Build the backend:

```bash
npm run build
```

### Step 6: Setup Frontend

```bash
cd ../frontend
npm ci --production
cp .env.example .env.production
```

Edit `.env.production` for production settings:

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Build the frontend:

```bash
npm run build
```

### Step 7: Set Up Nginx

Install Nginx:

```bash
sudo apt install -y nginx
```

Create configuration for the frontend:

```bash
sudo nano /etc/nginx/sites-available/bookreview-frontend
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Create configuration for the backend:

```bash
sudo nano /etc/nginx/sites-available/bookreview-backend
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configurations:

```bash
sudo ln -s /etc/nginx/sites-available/bookreview-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/bookreview-backend /etc/nginx/sites-enabled/
sudo nginx -t  # Test the configuration
sudo systemctl restart nginx
```

### Step 8: Set Up SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot --nginx -d api.your-domain.com
```

### Step 9: Start the Application with PM2

```bash
cd /path/to/bookreview-platform/backend
pm2 start dist/index.js --name bookreview-backend

cd /path/to/bookreview-platform/frontend
pm2 start npm --name bookreview-frontend -- start
```

Save the PM2 configuration to start on system boot:

```bash
pm2 startup
pm2 save
```

## Docker Deployment

### Step 1: Install Docker and Docker Compose

Follow the official Docker installation guide for your operating system:
- [Docker Installation](https://docs.docker.com/engine/install/)
- [Docker Compose Installation](https://docs.docker.com/compose/install/)

### Step 2: Configure Environment Files

Create `.env` files for both frontend and backend as described in the previous sections.

### Step 3: Build and Run with Docker Compose

Create or modify the `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    volumes:
      - ./backend/data:/app/data
    environment:
      - PORT=3001
      - NODE_ENV=production
    restart: unless-stopped
```

Start the services:

```bash
docker-compose up -d
```

To stop the services:

```bash
docker-compose down
```

## Cloud Deployment

### AWS Deployment

#### Step 1: Set Up AWS Infrastructure

1. Launch an EC2 instance (t3.medium or better recommended)
2. Configure Security Groups:
   - HTTP (80) and HTTPS (443) from anywhere
   - SSH (22) from your IP

#### Step 2: Deploy with Elastic Beanstalk (Alternative)

1. Install EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize the EB application:
   ```bash
   eb init
   ```

3. Create and deploy the environment:
   ```bash
   eb create bookreview-env
   ```

4. Configure environment variables in the AWS Console.

### Azure Deployment

#### Step 1: Deploy with Azure App Service

1. Install Azure CLI:
   ```bash
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. Login to Azure:
   ```bash
   az login
   ```

3. Create a resource group:
   ```bash
   az group create --name bookreview-resources --location eastus
   ```

4. Create App Service plans:
   ```bash
   az appservice plan create --name bookreview-plan --resource-group bookreview-resources --sku B1 --is-linux
   ```

5. Create and deploy web apps:
   ```bash
   # Backend
   az webapp create --resource-group bookreview-resources --plan bookreview-plan --name bookreview-backend --runtime "NODE|16-lts"
   
   # Frontend
   az webapp create --resource-group bookreview-resources --plan bookreview-plan --name bookreview-frontend --runtime "NODE|16-lts"
   ```

6. Configure environment variables through the Azure Portal.

## Environment Configuration

### Configuration Variables

#### Frontend (Next.js) Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:3001/api/v1 |
| NEXT_PUBLIC_SITE_URL | Frontend URL | http://localhost:3000 |
| NEXT_PUBLIC_GOOGLE_ANALYTICS_ID | Google Analytics ID | UA-XXXXXXXXX-X |
| NEXT_PUBLIC_SOCIAL_AUTH_GOOGLE | Enable Google auth | true |
| NEXT_PUBLIC_SOCIAL_AUTH_FACEBOOK | Enable Facebook auth | true |

#### Backend (Express) Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |
| JWT_SECRET | Secret for JWT | random_secure_string |
| JWT_EXPIRY | Token expiry | 3600 (in seconds) |
| OPENAI_API_KEY | OpenAI API key | sk-xxxx |
| CORS_ORIGIN | Allowed origins | http://localhost:3000 |
| LOG_LEVEL | Logging level | info |

### Managing Secrets

For production environments, use a secrets management solution:

- **AWS**: AWS Secrets Manager
- **Azure**: Azure Key Vault
- **Local**: Use environment variables or .env files (not in git)

Example of loading secrets in the backend:

```javascript
// config/secrets.js
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function getSecret(name) {
  const [version] = await client.accessSecretVersion({
    name: `projects/project-id/secrets/${name}/versions/latest`,
  });
  
  return version.payload.data.toString();
}

module.exports = { getSecret };
```

## Database Setup

The BookReview platform uses a file-based data store that can be migrated to a database.

### Setting Up File-Based Storage

The default configuration uses JSON files in the `backend/data` directory:

```
backend/data/
  ├── books/       # Book data files
  ├── users/       # User data files
  ├── reviews/     # Review data files
  ├── indexes/     # Search indexes
  └── tokens/      # Authentication tokens
```

Ensure this directory structure exists and is writable:

```bash
mkdir -p backend/data/{books,users,reviews,indexes,tokens}
chmod -R 755 backend/data
```

### Migrating to MongoDB

To migrate to MongoDB:

1. Install MongoDB dependencies:
   ```bash
   cd backend
   npm install mongodb mongoose
   ```

2. Update `.env` with MongoDB connection string:
   ```
   MONGODB_URI=mongodb://username:password@host:port/bookreview
   USE_MONGODB=true
   ```

3. Run the migration script:
   ```bash
   node scripts/migrateToNewStorage.js
   ```

## External API Integration

### OpenAI API Setup

1. Get an API key from [OpenAI](https://openai.com/api/)
2. Add the key to your `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

### Social Authentication Setup

#### Google OAuth

1. Create a project in [Google Developer Console](https://console.developers.google.com/)
2. Configure OAuth consent screen
3. Create OAuth client ID for Web Application
4. Add authorized redirect URIs (e.g., `http://localhost:3001/api/v1/auth/google/callback` for development)
5. Add credentials to `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

#### Facebook OAuth

1. Create an app in [Facebook Developers](https://developers.facebook.com/)
2. Add Facebook Login product
3. Configure Valid OAuth Redirect URIs
4. Add credentials to `.env`:
   ```
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   ```

## Security Configurations

### CORS Setup

Configure CORS in `backend/src/config/cors.ts`:

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

export default cors(corsOptions);
```

### Content Security Policy

Configure CSP in `frontend/next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https://*.googleapis.com;
      font-src 'self' data:;
      connect-src 'self' https://api.your-domain.com;
    `
  }
  // Add other headers as needed
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  }
};
```

### Rate Limiting

Configure rate limiting in `backend/src/middlewares/rateLimit.ts`:

```typescript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
});
```

Apply the middleware in `app.ts`:

```typescript
import { apiLimiter, authLimiter } from './middlewares/rateLimit';

// Apply to all requests
app.use('/api/', apiLimiter);

// Apply to authentication endpoints
app.use('/api/v1/auth/', authLimiter);
```

## Testing Installation

### Automated Testing

Run the test suite to ensure everything is configured correctly:

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

### Manual Testing

1. Verify frontend access:
   - Open http://localhost:3000 (or your configured URL)
   - Confirm the home page loads correctly

2. Test user authentication:
   - Register a new account
   - Log in with the created credentials
   - Verify that protected routes are accessible

3. Test core functionality:
   - Browse books
   - Add a book to your shelves
   - Write a review
   - Search for books

4. Test API endpoints:
   - Use a tool like Postman to test API endpoints
   - Verify that protected endpoints require authentication

## Troubleshooting

### Common Issues and Solutions

#### Backend Won't Start

**Issue**: `Error: ENOENT: no such file or directory, open 'backend/data/indexes/books.json'`

**Solution**: Create required directories and files:
```bash
mkdir -p backend/data/indexes
echo "[]" > backend/data/indexes/books.json
```

#### Frontend API Connection Issues

**Issue**: "Failed to fetch" or "Network Error" in frontend console

**Solution**: Check CORS configuration and ensure backend is running:
```bash
# Verify backend is running
curl http://localhost:3001/api/v1/health

# Check CORS settings in .env files
```

#### Authentication Failures

**Issue**: "Invalid token" or "JWT malformed"

**Solution**: 
- Ensure JWT_SECRET is the same across all instances
- Check token expiry settings
- Verify clock synchronization between servers

#### Memory Issues

**Issue**: "JavaScript heap out of memory"

**Solution**: Increase Node.js memory limit:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Logs and Diagnostics

Access application logs:

```bash
# PM2 logs
pm2 logs bookreview-backend
pm2 logs bookreview-frontend

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

Nginx logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Getting Help

If you encounter issues not covered in this guide:

- Check the GitHub repository issues section
- Contact the development team at dev@bookreview.com
- Join our Discord community for real-time support

---

## Additional Resources

- [Backend API Documentation](/docs/api-docs.md)
- [Frontend Development Guide](/docs/frontend-development.md)
- [Data Migration Guide](/docs/data-migration.md)
- [Security Best Practices](/docs/security.md)

---

*This installation guide was last updated on August 31, 2025.*
