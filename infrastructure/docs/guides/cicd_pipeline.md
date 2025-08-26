# CI/CD Pipeline Guide for BookReview Platform

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) pipeline setup for the BookReview Platform.

## Overview

The BookReview Platform uses GitHub Actions for CI/CD to automate testing, building, and deployment processes. This pipeline ensures code quality and streamlines the delivery process from development to production.

## Pipeline Architecture

Our CI/CD pipeline follows these main stages:

1. **Trigger**: Code changes pushed to specific branches
2. **Build**: Compile and build the application
3. **Test**: Run unit, integration, and end-to-end tests
4. **Analyze**: Static code analysis and security scanning
5. **Deploy**: Deploy to the appropriate environment
6. **Verify**: Post-deployment health checks

## Directory Structure

```
.github/
└── workflows/
    ├── ci.yml                # Main CI workflow
    ├── frontend-deploy.yml   # Frontend deployment workflow
    ├── backend-deploy.yml    # Backend deployment workflow
    └── infrastructure-deploy.yml # Infrastructure deployment workflow
```

## Workflow Configurations

### Main CI Workflow

This workflow runs on every pull request to ensure code quality:

```yaml
name: CI

on:
  pull_request:
    branches: [ main, develop ]
  push:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          cd ../backend
          npm ci
      - name: Lint frontend
        run: |
          cd frontend
          npm run lint
      - name: Lint backend
        run: |
          cd backend
          npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          cd ../backend
          npm ci
      - name: Test frontend
        run: |
          cd frontend
          npm test
      - name: Test backend
        run: |
          cd backend
          npm test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          cd ../backend
          npm ci
      - name: Build frontend
        run: |
          cd frontend
          npm run build
      - name: Build backend
        run: |
          cd backend
          npm run build
```

### Frontend Deployment Workflow

This workflow deploys the frontend to AWS:

```yaml
name: Deploy Frontend

on:
  workflow_dispatch:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Build frontend
        run: |
          cd frontend
          npm run build
          
      - name: Build Docker image
        run: |
          cd frontend
          docker build -t ${{ secrets.ECR_REPOSITORY_URL }}/bookreview-frontend:${{ github.sha }} .
          
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
        
      - name: Push to ECR
        run: |
          docker push ${{ secrets.ECR_REPOSITORY_URL }}/bookreview-frontend:${{ github.sha }}
          
      - name: Update ECS service
        run: |
          aws ecs update-service --cluster bookreview-cluster --service bookreview-frontend-service --force-new-deployment
          
      - name: Health check
        run: |
          sleep 30
          curl -f https://${{ secrets.FRONTEND_URL }}/api/health || exit 1
```

### Backend Deployment Workflow

This workflow deploys the backend to AWS:

```yaml
name: Deploy Backend

on:
  workflow_dispatch:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          
      - name: Build backend
        run: |
          cd backend
          npm run build
          
      - name: Build Docker image
        run: |
          cd backend
          docker build -t ${{ secrets.ECR_REPOSITORY_URL }}/bookreview-backend:${{ github.sha }} .
          
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
        
      - name: Push to ECR
        run: |
          docker push ${{ secrets.ECR_REPOSITORY_URL }}/bookreview-backend:${{ github.sha }}
          
      - name: Update ECS service
        run: |
          aws ecs update-service --cluster bookreview-cluster --service bookreview-backend-service --force-new-deployment
          
      - name: Health check
        run: |
          sleep 30
          curl -f https://${{ secrets.BACKEND_URL }}/api/v1/health || exit 1
```

### Infrastructure Deployment Workflow

This workflow manages infrastructure using Terraform:

```yaml
name: Deploy Infrastructure

on:
  workflow_dispatch:
  push:
    branches: [ main ]
    paths:
      - 'infrastructure/terraform/**'

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v1
        with:
          terraform_version: 1.0.0
          
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Terraform Init
        run: |
          cd infrastructure/terraform/environments/production
          terraform init
          
      - name: Terraform Plan
        run: |
          cd infrastructure/terraform/environments/production
          terraform plan -out=tfplan
          
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: |
          cd infrastructure/terraform/environments/production
          terraform apply -auto-approve tfplan
```

## Environment Configuration

Our CI/CD pipeline uses GitHub Actions secrets to manage sensitive information:

### Required Secrets

1. **AWS Credentials**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. **ECR Repository**:
   - `ECR_REPOSITORY_URL`

3. **Deployment URLs**:
   - `FRONTEND_URL`
   - `BACKEND_URL`

4. **Application Secrets**:
   - `JWT_SECRET`
   - `DB_PASSWORD`
   - Other sensitive environment variables

## Deployment Environments

The BookReview Platform has three deployment environments:

### 1. Development Environment

- **Branch**: `develop`
- **Deployment**: Automatic on push to develop
- **URL**: `dev.bookreview.com`
- **Purpose**: Testing new features and bug fixes

### 2. Staging Environment

- **Branch**: `staging`
- **Deployment**: Manual approval after successful CI on develop
- **URL**: `staging.bookreview.com`
- **Purpose**: Pre-production testing and validation

### 3. Production Environment

- **Branch**: `main`
- **Deployment**: Manual approval after successful deployment to staging
- **URL**: `bookreview.com`
- **Purpose**: Live application for end users

## Deployment Strategy

The BookReview Platform uses a blue-green deployment strategy:

1. New version is deployed to a separate environment
2. Tests verify the new deployment
3. Traffic is switched from old version to new version
4. Old version remains available for quick rollback if needed

## Monitoring and Alerting

The CI/CD pipeline integrates with monitoring tools:

1. **CloudWatch**: Monitors infrastructure and application metrics
2. **Sentry**: Tracks application errors
3. **Slack Notifications**: Alerts the team about deployment status

## Best Practices Implemented

1. **Automated Testing**:
   - All code changes require passing tests
   - Coverage thresholds enforced

2. **Infrastructure as Code**:
   - All infrastructure changes tracked in version control
   - Terraform validation before deployment

3. **Security Scanning**:
   - Dependency scanning for vulnerabilities
   - Static code analysis for security issues

4. **Approval Gates**:
   - Manual approvals for production deployments
   - Automatic rollbacks for failed deployments

5. **Immutable Infrastructure**:
   - New deployments create new resources
   - No modifications to running instances

## Troubleshooting Common Issues

1. **Failed Tests in CI**:
   - Check test logs for specific failures
   - Run tests locally with `npm test` to reproduce

2. **Deployment Failures**:
   - Verify AWS credentials are valid
   - Check CloudWatch logs for errors
   - Verify resource availability (e.g., ECR repository)

3. **Infrastructure Drift**:
   - Run `terraform plan` to identify differences
   - Use state locking to prevent concurrent modifications

## Setting Up Local Development Pipeline

For testing the CI/CD pipeline locally:

1. **Install GitHub Actions Runner**:
   ```bash
   mkdir actions-runner && cd actions-runner
   curl -O -L https://github.com/actions/runner/releases/download/v2.278.0/actions-runner-linux-x64-2.278.0.tar.gz
   tar xzf ./actions-runner-linux-x64-2.278.0.tar.gz
   ```

2. **Configure Runner**:
   ```bash
   ./config.sh --url https://github.com/yourusername/bookreviewapp --token REGISTRATION_TOKEN
   ```

3. **Run Locally**:
   ```bash
   ./run.sh
   ```

This allows testing workflows without pushing to GitHub.
