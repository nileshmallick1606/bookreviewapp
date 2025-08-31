# CI/CD Pipeline Documentation

**Version:** 1.0  
**Date:** August 31, 2025  
**Author:** DevOps Team

This document details the Continuous Integration and Continuous Deployment (CI/CD) pipeline configuration for the BookReview Platform, providing a comprehensive guide for developers and operations teams.

## Table of Contents

1. [CI/CD Overview](#cicd-overview)
2. [Pipeline Architecture](#pipeline-architecture)
3. [GitHub Actions Workflow](#github-actions-workflow)
4. [Build Process](#build-process)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Environments](#deployment-environments)
7. [Infrastructure as Code](#infrastructure-as-code)
8. [Monitoring and Observability](#monitoring-and-observability)
9. [Security Scanning](#security-scanning)
10. [Documentation Integration](#documentation-integration)
11. [Rollback Procedures](#rollback-procedures)
12. [Pipeline Maintenance](#pipeline-maintenance)

## CI/CD Overview

### Philosophy and Goals

The BookReview Platform's CI/CD pipeline is designed with these principles in mind:

1. **Automation First**: Minimize manual steps to reduce human error
2. **Fast Feedback**: Provide quick feedback on code quality and test results
3. **Consistency**: Ensure consistency across all environments
4. **Security**: Integrate security testing throughout the pipeline
5. **Observability**: Monitor all aspects of the pipeline for continuous improvement

### Pipeline Workflow

The CI/CD workflow follows these stages:

1. **Code**: Developers write and commit code to feature branches
2. **Build**: Code is compiled and built into deployable artifacts
3. **Test**: Automated tests run against the build
4. **Analyze**: Code quality and security scans are performed
5. **Deploy**: Code is deployed to appropriate environment
6. **Verify**: Post-deployment tests confirm functionality
7. **Monitor**: Application performance and usage is monitored

### CI/CD Tools

The BookReview Platform uses the following tools:

| Tool | Purpose |
|------|---------|
| GitHub Actions | Workflow automation and CI/CD orchestration |
| Docker | Application containerization |
| Terraform | Infrastructure as Code |
| Jest | JavaScript/TypeScript testing |
| Cypress | End-to-end testing |
| SonarCloud | Code quality analysis |
| Snyk | Security vulnerability scanning |
| AWS CloudFormation | Cloud resource management |
| New Relic | Application performance monitoring |
| Sentry | Error tracking and monitoring |

## Pipeline Architecture

### High-Level Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Developer  │────▶│   GitHub    │────▶│GitHub Actions│────▶│  AWS Cloud  │
│  Workflow   │     │ Repository  │     │   Pipeline   │     │ Environments│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                    │Code Quality │     │ Automated   │     │ Monitoring  │
                    │   Checks    │     │   Tests     │     │  & Alerting │
                    └─────────────┘     └─────────────┘     └─────────────┘
```

### Pipeline Stages

1. **Source**: Code checkout from GitHub repository
2. **Dependencies**: Install and cache dependencies
3. **Lint**: Code style and quality checks
4. **Build**: Compile and build application
5. **Unit Test**: Run unit tests
6. **Integration Test**: Run integration tests
7. **Security Scan**: Check for vulnerabilities
8. **Quality Analysis**: Code quality assessment
9. **Artifact Creation**: Package application artifacts
10. **Deploy**: Deploy to target environment
11. **Smoke Test**: Basic functionality verification
12. **E2E Test**: Complete end-to-end testing

## GitHub Actions Workflow

### Workflow Files

The BookReview Platform uses multiple workflow files:

1. **PR Validation**: `.github/workflows/pr-validation.yml`
2. **Main Branch CI**: `.github/workflows/main-ci.yml`
3. **Development Deploy**: `.github/workflows/dev-deploy.yml`
4. **Staging Deploy**: `.github/workflows/staging-deploy.yml`
5. **Production Deploy**: `.github/workflows/prod-deploy.yml`

### PR Validation Workflow

```yaml
# .github/workflows/pr-validation.yml
name: PR Validation

on:
  pull_request:
    branches: [ main, develop ]
    
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          cd ../backend
          npm ci
          
      - name: Lint
        run: |
          cd frontend
          npm run lint
          cd ../backend
          npm run lint
          
      - name: Build
        run: |
          cd frontend
          npm run build
          cd ../backend
          npm run build
          
      - name: Test
        run: |
          cd frontend
          npm test
          cd ../backend
          npm test
          
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Main Branch CI Workflow

```yaml
# .github/workflows/main-ci.yml
name: Main CI

on:
  push:
    branches: [ main ]
    
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Similar steps as PR validation
      # ...
      
      - name: Build and push Docker images
        uses: docker/build-push-action@v2
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.ECR_REPOSITORY_URL }}/bookreview-backend:${{ github.sha }}
      
      # Frontend build and push
      # ...
      
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to Staging
        run: |
          aws cloudformation deploy \
            --template-file infrastructure/cloudformation/staging.yml \
            --stack-name bookreview-staging \
            --parameter-overrides \
              ImageTag=${{ github.sha }} \
              Environment=staging
```

### Environment-Specific Deployment Workflow

```yaml
# .github/workflows/prod-deploy.yml
name: Production Deployment

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version tag to deploy'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to Production
        run: |
          aws cloudformation deploy \
            --template-file infrastructure/cloudformation/production.yml \
            --stack-name bookreview-production \
            --parameter-overrides \
              ImageTag=${{ github.event.inputs.version }} \
              Environment=production
      
      - name: Run smoke tests
        run: |
          cd tests
          npm ci
          npm run smoke-test -- --env=production
      
      - name: Create deployment record
        uses: chrnorm/deployment-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          environment: production
          ref: ${{ github.event.inputs.version }}
```

### GitHub Secrets Management

The following secrets are configured in the GitHub repository:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key for deployment |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for deployment |
| `ECR_REPOSITORY_URL` | URL of the ECR repository |
| `SONAR_TOKEN` | Token for SonarCloud integration |
| `SNYK_TOKEN` | Token for Snyk security scanning |
| `SLACK_WEBHOOK` | Webhook URL for Slack notifications |
| `NEW_RELIC_LICENSE_KEY` | License key for New Relic integration |

## Build Process

### Frontend Build

The frontend build process creates optimized assets for deployment:

```yaml
steps:
  - name: Install dependencies
    run: |
      cd frontend
      npm ci
  
  - name: Run type checking
    run: |
      cd frontend
      npm run type-check
  
  - name: Build frontend
    run: |
      cd frontend
      npm run build
    env:
      NEXT_PUBLIC_API_URL: ${{ env.API_URL }}
      NEXT_PUBLIC_ENVIRONMENT: ${{ env.ENVIRONMENT }}
  
  - name: Export static assets
    run: |
      cd frontend
      npm run export
```

### Backend Build

The backend build compiles TypeScript and prepares for deployment:

```yaml
steps:
  - name: Install dependencies
    run: |
      cd backend
      npm ci
  
  - name: Build backend
    run: |
      cd backend
      npm run build
  
  - name: Package backend
    run: |
      cd backend
      mkdir -p dist/data
      cp -r package.json dist/
      cp -r .env.example dist/.env
```

### Docker Containerization

Both frontend and backend are containerized using Docker:

**Backend Dockerfile**:

```dockerfile
# backend/Dockerfile
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm ci --only=production

VOLUME /app/data
EXPOSE 3001

CMD ["node", "dist/index.js"]
```

**Frontend Dockerfile**:

```dockerfile
# frontend/Dockerfile
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
```

### Artifact Management

Artifacts are stored and versioned for deployment:

1. **Docker Images**: Stored in Amazon ECR
2. **Frontend Assets**: Stored in Amazon S3
3. **Configuration**: Stored in AWS SSM Parameter Store
4. **Infrastructure Templates**: Stored in GitHub with version control

## Testing Strategy

### Test Execution in CI/CD

Tests run at different stages in the pipeline:

1. **PR Validation**: Unit tests, linting, type checking
2. **Build Pipeline**: Unit and integration tests
3. **Deployment Pipeline**: Smoke tests, end-to-end tests

### Unit Testing Configuration

Unit tests run with Jest:

```yaml
- name: Run unit tests
  run: |
    cd backend
    npm test -- --coverage
    
- name: Upload test coverage
  uses: codecov/codecov-action@v2
  with:
    directory: ./backend/coverage
    flags: backend,unit
```

### Integration Testing

Integration tests verify component interactions:

```yaml
- name: Run integration tests
  run: |
    cd backend
    npm run test:integration
  env:
    NODE_ENV: test
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

### End-to-End Testing

E2E tests run with Cypress:

```yaml
- name: Start application for E2E tests
  run: |
    docker-compose -f docker-compose.test.yml up -d
    
- name: Wait for application
  run: |
    ./scripts/wait-for-app.sh http://localhost:3000
    
- name: Run E2E tests
  run: |
    cd frontend
    npm run test:e2e
    
- name: Store test artifacts
  uses: actions/upload-artifact@v2
  if: always()
  with:
    name: cypress-results
    path: |
      frontend/cypress/videos
      frontend/cypress/screenshots
```

### Automated Security Testing

Security scanning is integrated in the pipeline:

```yaml
- name: Dependency vulnerability scan
  run: |
    npx snyk test --all-projects
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    
- name: Container security scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ secrets.ECR_REPOSITORY_URL }}/bookreview-backend:${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## Deployment Environments

### Environment Configuration

The BookReview platform uses distinct environments:

1. **Development**: For active development and feature testing
2. **Staging**: For pre-production testing and validation
3. **Production**: For end-user access

### Environment Variables

Environment-specific variables are managed through:

1. **Local Development**: `.env.local` files
2. **CI/CD Pipeline**: GitHub Secrets and Environment Variables
3. **Runtime**: AWS SSM Parameter Store and Secrets Manager

**Example Parameter Store Structure**:

```
/bookreview/
├── dev/
│   ├── api/PORT
│   ├── api/JWT_SECRET
│   ├── api/OPENAI_API_KEY
├── staging/
│   ├── api/PORT
│   ├── api/JWT_SECRET
│   ├── api/OPENAI_API_KEY
├── prod/
    ├── api/PORT
    ├── api/JWT_SECRET
    ├── api/OPENAI_API_KEY
```

### Deployment Strategy

The BookReview platform uses different deployment strategies:

1. **Development**: Direct deployment on push to develop branch
2. **Staging**: Automated deployment on merge to main branch
3. **Production**: Manual approval after successful staging deployment

### Blue-Green Deployment

Production deployments use blue-green strategy:

```yaml
- name: Deploy new environment (green)
  run: |
    aws cloudformation deploy \
      --template-file infrastructure/cloudformation/production-green.yml \
      --stack-name bookreview-production-green \
      --parameter-overrides ImageTag=${{ github.event.inputs.version }}
      
- name: Run validation tests
  run: |
    cd tests
    npm run validation -- --target=green
    
- name: Switch traffic to green environment
  if: success()
  run: |
    aws cloudformation update-stack \
      --stack-name bookreview-production-router \
      --use-previous-template \
      --parameters ParameterKey=ActiveEnvironment,ParameterValue=green
```

## Infrastructure as Code

### Terraform Configuration

The infrastructure is defined using Terraform:

**Main Infrastructure**:

```hcl
# infrastructure/terraform/main.tf
provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/vpc"
  environment = var.environment
  cidr_block = var.vpc_cidr
}

module "ecs" {
  source = "./modules/ecs"
  environment = var.environment
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
}

module "rds" {
  source = "./modules/rds"
  environment = var.environment
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.database_subnet_ids
}

module "s3" {
  source = "./modules/s3"
  environment = var.environment
}

module "cloudfront" {
  source = "./modules/cloudfront"
  environment = var.environment
  s3_bucket_domain = module.s3.bucket_domain_name
}
```

**Environment Configuration**:

```hcl
# infrastructure/terraform/environments/production/main.tf
module "bookreview" {
  source = "../../"
  
  environment = "production"
  aws_region = "us-east-1"
  vpc_cidr = "10.0.0.0/16"
  
  frontend_instances = 2
  backend_instances = 2
  database_instance_class = "db.t3.medium"
  
  domain_name = "bookreview.example.com"
  certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/uuid"
}
```

### CloudFormation Templates

AWS-specific resources are defined in CloudFormation:

```yaml
# infrastructure/cloudformation/production.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'BookReview Platform Production Environment'

Parameters:
  ImageTag:
    Type: String
    Description: Docker image tag to deploy
  Environment:
    Type: String
    Default: production
    
Resources:
  ECSCluster:
    Type: 'AWS::ECS::Cluster'
    Properties:
      ClusterName: !Sub 'bookreview-${Environment}'
  
  TaskDefinition:
    Type: 'AWS::ECS::TaskDefinition'
    Properties:
      Family: !Sub 'bookreview-${Environment}'
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
      Cpu: '512'
      Memory: '1024'
      ExecutionRoleArn: !GetAtt ECSExecutionRole.Arn
      TaskRoleArn: !GetAtt ECSTaskRole.Arn
      ContainerDefinitions:
        - Name: backend
          Image: !Sub '${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/bookreview-backend:${ImageTag}'
          Essential: true
          PortMappings:
            - ContainerPort: 3001
          Environment:
            - Name: NODE_ENV
              Value: production
            - Name: PORT
              Value: '3001'
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: !Ref CloudWatchLogsGroup
              awslogs-region: !Ref 'AWS::Region'
              awslogs-stream-prefix: backend
  
  # Additional resources...
```

## Monitoring and Observability

### Application Performance Monitoring

APM is implemented using New Relic:

```javascript
// backend/src/config/monitoring.ts
import newrelic from 'newrelic';

export const setupMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    // New Relic is automatically initialized via newrelic.js config
    
    // Add custom attributes
    newrelic.addCustomAttribute('app_version', process.env.APP_VERSION || 'unknown');
    
    // Add custom metrics
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      newrelic.recordMetric('Custom/Memory/heapUsed', memoryUsage.heapUsed / 1024 / 1024);
      newrelic.recordMetric('Custom/Memory/rss', memoryUsage.rss / 1024 / 1024);
    }, 60000);
  }
};
```

### Frontend Monitoring

Frontend performance is monitored using:

```javascript
// frontend/src/utils/analytics.ts
import { init as sentryInit } from '@sentry/nextjs';
import * as NewRelicBrowser from 'newrelic-browser';

export const initMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    sentryInit({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
      tracesSampleRate: 0.2,
    });
    
    // New Relic Browser monitoring
    NewRelicBrowser.setCustomAttribute('environment', process.env.NEXT_PUBLIC_ENVIRONMENT);
  }
};
```

### Logging Configuration

Centralized logging with CloudWatch:

```yaml
# infrastructure/terraform/modules/ecs/main.tf
resource "aws_cloudwatch_log_group" "app_logs" {
  name = "/ecs/${var.environment}/bookreview"
  retention_in_days = 30
  
  tags = {
    Environment = var.environment
    Application = "bookreview"
  }
}
```

### Alerting Setup

Alerts are configured for critical metrics:

```yaml
# infrastructure/terraform/modules/monitoring/main.tf
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name = "${var.environment}-api-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods = 1
  metric_name = "5XXError"
  namespace = "AWS/ApiGateway"
  period = 60
  statistic = "Sum"
  threshold = 5
  alarm_description = "5XX errors from API Gateway"
  
  dimensions = {
    ApiName = aws_api_gateway_rest_api.api.name
    Stage = var.environment
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
}
```

## Security Scanning

### Dependency Scanning

Dependency vulnerabilities are scanned using Snyk:

```yaml
- name: Scan dependencies
  run: |
    cd backend
    npx snyk test --severity-threshold=high
    cd ../frontend
    npx snyk test --severity-threshold=high
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Static Application Security Testing

SAST is performed using SonarCloud:

```yaml
- name: SonarCloud Analysis
  uses: SonarSource/sonarcloud-github-action@master
  with:
    projectBaseDir: .
    args: >
      -Dsonar.projectKey=bookreview-platform
      -Dsonar.organization=organization-key
      -Dsonar.sources=frontend/src,backend/src
      -Dsonar.tests=frontend/src/__tests__,backend/tests
      -Dsonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info,backend/coverage/lcov.info
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Dynamic Application Security Testing

DAST is performed using OWASP ZAP:

```yaml
- name: Run DAST scan
  uses: zaproxy/action-baseline@v0.7.0
  with:
    target: https://staging.bookreview.example.com
```

### Security Headers Check

Security headers are verified in CI:

```yaml
- name: Check security headers
  run: |
    npx @mcinnes/http-observatory-cli --url https://staging.bookreview.example.com --min-score 85
```

## Documentation Integration

### API Documentation Generation

API documentation is automatically generated and published:

```yaml
- name: Generate API documentation
  run: |
    cd backend
    npm run generate-docs
    
- name: Deploy API documentation
  if: github.ref == 'refs/heads/main'
  run: |
    aws s3 sync ./backend/docs/api s3://bookreview-docs/api --delete
```

### Architecture Diagram Generation

Architecture diagrams are generated from code:

```yaml
- name: Generate architecture diagrams
  run: |
    cd infrastructure/diagrams
    pip install -r requirements.txt
    python generate_diagrams.py
    
- name: Deploy architecture diagrams
  if: github.ref == 'refs/heads/main'
  run: |
    aws s3 sync ./infrastructure/diagrams/output s3://bookreview-docs/architecture --delete
```

### Release Notes Generation

Release notes are automatically generated from commit history:

```yaml
- name: Generate release notes
  uses: mikepenz/release-changelog-builder-action@v1
  with:
    configuration: "release-changelog-config.json"
    commitMode: true
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Rollback Procedures

### Automatic Rollback

Automatic rollbacks occur on deployment failures:

```yaml
- name: Deploy to environment
  id: deploy
  run: |
    aws cloudformation deploy \
      --template-file infrastructure/cloudformation/production.yml \
      --stack-name bookreview-production \
      --parameter-overrides ImageTag=${{ github.sha }}
    
- name: Run smoke tests
  id: smoke-tests
  run: |
    cd tests
    npm run smoke-test
    
- name: Rollback on failure
  if: failure() && (steps.deploy.outcome == 'success' || steps.smoke-tests.outcome == 'failure')
  run: |
    aws cloudformation deploy \
      --template-file infrastructure/cloudformation/production.yml \
      --stack-name bookreview-production \
      --parameter-overrides ImageTag=${{ env.PREVIOUS_IMAGE_TAG }}
```

### Manual Rollback

Manual rollback procedure through GitHub Actions:

```yaml
name: Rollback Production

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy previous version
        run: |
          aws cloudformation deploy \
            --template-file infrastructure/cloudformation/production.yml \
            --stack-name bookreview-production \
            --parameter-overrides ImageTag=${{ github.event.inputs.version }}
      
      - name: Create rollback record
        run: |
          echo "Rolled back to version ${{ github.event.inputs.version }} at $(date)" >> ROLLBACK_HISTORY.md
          git config --global user.name 'CI Bot'
          git config --global user.email 'ci-bot@example.com'
          git add ROLLBACK_HISTORY.md
          git commit -m "Document rollback to version ${{ github.event.inputs.version }}"
          git push
```

### Version History

Version history tracking for rollbacks:

```yaml
- name: Record deployment version
  if: success() && github.ref == 'refs/heads/main'
  run: |
    aws ssm put-parameter \
      --name "/bookreview/production/PREVIOUS_VERSION" \
      --value "$PREVIOUS_VERSION" \
      --type "String" \
      --overwrite
    aws ssm put-parameter \
      --name "/bookreview/production/CURRENT_VERSION" \
      --value "${{ github.sha }}" \
      --type "String" \
      --overwrite
  env:
    PREVIOUS_VERSION: $(aws ssm get-parameter --name "/bookreview/production/CURRENT_VERSION" --query "Parameter.Value" --output text)
```

## Pipeline Maintenance

### Pipeline Performance Optimization

CI/CD pipeline performance is optimized through:

1. **Caching**:
   ```yaml
   - name: Cache dependencies
     uses: actions/cache@v3
     with:
       path: |
         **/node_modules
       key: ${{ runner.os }}-modules-${{ hashFiles('**/package-lock.json') }}
   ```

2. **Parallel Execution**:
   ```yaml
   jobs:
     backend-tests:
       runs-on: ubuntu-latest
       # Backend test steps...
     
     frontend-tests:
       runs-on: ubuntu-latest
       # Frontend test steps...
     
     deploy:
       needs: [backend-tests, frontend-tests]
       # Deploy steps...
   ```

3. **Conditional Steps**:
   ```yaml
   - name: Run E2E tests
     if: github.event_name == 'push' || github.event.pull_request.head.repo.full_name == github.repository
     # E2E test steps...
   ```

### Pipeline Monitoring

CI/CD pipeline performance metrics are monitored:

1. **GitHub Actions Metrics**:
   - Job duration
   - Success/failure rate
   - Resource usage

2. **Custom Metrics**:
   ```yaml
   - name: Record deployment metrics
     run: |
       curl -X POST "https://metrics-api.example.com/metrics" \
         -H "Content-Type: application/json" \
         -d '{
           "metric": "deployment_duration",
           "value": ${{ steps.timer.outputs.duration }},
           "environment": "${{ env.ENVIRONMENT }}",
           "version": "${{ github.sha }}"
         }'
     if: always()
   ```

### Pipeline Documentation

Pipeline documentation is maintained in the repository:

1. **Workflow Documentation Comments**:
   ```yaml
   # .github/workflows/production-deploy.yml
   
   # This workflow handles production deployments using a blue-green strategy.
   # It requires manual approval before deployment starts and includes post-deployment verification.
   # In case of failure, automatic rollback is triggered.
   
   name: Production Deployment
   # ...
   ```

2. **Pipeline Visualization**:
   ```yaml
   - name: Generate pipeline visualization
     run: |
       npx github-workflow-viz -w .github/workflows/main-ci.yml -o docs/pipeline/main-ci.png
   ```

### Pipeline Status Badges

Pipeline status badges in documentation:

```markdown
# BookReview Platform

![Main CI](https://github.com/organization/bookreview-platform/actions/workflows/main-ci.yml/badge.svg)
![Production Deploy](https://github.com/organization/bookreview-platform/actions/workflows/prod-deploy.yml/badge.svg)
```

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [Terraform Documentation](https://www.terraform.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [SonarCloud Documentation](https://sonarcloud.io/documentation)

---

*This CI/CD pipeline documentation was last updated on August 31, 2025.*
