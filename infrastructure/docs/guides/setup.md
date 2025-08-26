# Infrastructure Setup Guide

## Overview
This document provides a comprehensive guide for setting up the BookReview Platform infrastructure using Terraform and Docker. The infrastructure is designed to be deployed on AWS with a modular approach to support multiple environments (development, staging, production).

## Architecture Diagram

```
                                   +----------------+
                                   |                |
                Internet          +|  CloudFront    |
                   |              ||  (Optional)    |
                   v              |+----------------+
        +---------------------+   |
        |                     |   |  +-------------+
        |  Application Load   |----->| Frontend EC2 |
        |  Balancer (ALB)     |   |  | Auto-scaling |
        |                     |   |  +-------------+
        +---------------------+   |         |
                   |             |          v
                   v             |  +----------------+
        +---------------------+  |  |                |
        |                     |  |  | S3 Frontend    |
        |  API Gateway /      |---->| Static Content |
        |  Backend Service    |  |  |                |
        |                     |  |  +----------------+
        +---------------------+  |
                   |             |
                   v             |
        +---------------------+  |  +----------------+
        |                     |  |  |                |
        | Backend EC2         |---->| S3 Data Bucket |
        | Auto-scaling        |     | (JSON files)   |
        |                     |     |                |
        +---------------------+     +----------------+
```

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Terraform v1.5.0 or later
- Docker and Docker Compose installed locally

## Infrastructure Components

### 1. Networking
- VPC with public and private subnets
- Internet Gateway for public internet access
- NAT Gateway for outbound internet access from private subnets
- Route tables for traffic management
- Security groups for access control

### 2. Compute Resources
- Application Load Balancer to distribute traffic
- EC2 instances for frontend and backend services
- Auto-scaling groups to handle load changes
- Launch templates with user data for instance configuration

### 3. Storage Resources
- S3 bucket for frontend static assets
- S3 bucket for application data (JSON files)
- Lifecycle policies for data management

### 4. Security Components
- IAM roles and policies for EC2 instances
- Security groups to control traffic flow
- S3 bucket policies to restrict access

## Setup Instructions

### 1. Remote State Configuration
Before deploying the infrastructure, set up the remote state backend:

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://bookreview-terraform-state --region us-east-1

# Create DynamoDB table for state locking
aws dynamodb create-table \
    --table-name terraform-state-lock \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region us-east-1
```

### 2. Deploying Infrastructure
To deploy the infrastructure to a specific environment:

```bash
# Navigate to the environment directory
cd infrastructure/terraform/environments/dev

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the configuration
terraform apply
```

### 3. Local Development with Docker
For local development using Docker:

```bash
# Navigate to the Docker directory
cd infrastructure/docker

# Start the services
docker-compose up

# Access the frontend at http://localhost:3000
# Access the backend API at http://localhost:3001
```

## Environment-Specific Configurations

### Development (dev)
- Minimal infrastructure for cost savings
- Single instance for each service
- No NAT Gateway to reduce costs
- Reduced instance sizes

### Staging
- Similar to production but with reduced capacity
- Used for pre-production testing
- Includes NAT Gateway for private subnets

### Production (prod)
- Full redundancy with multi-AZ deployment
- Higher capacity with larger instance types
- Enhanced security measures
- Complete monitoring and alerting setup

## Maintenance and Operations

### Scaling the Infrastructure
The infrastructure is designed to scale automatically based on load:
- Auto-scaling groups adjust the number of instances
- ALB distributes traffic across healthy instances
- S3 buckets scale automatically with usage

### Monitoring and Logging
- CloudWatch for metrics and logs
- CloudTrail for API auditing
- S3 access logs for bucket activity

### Backup and Disaster Recovery
- S3 versioning enabled for data protection
- Multi-AZ deployment for high availability
- Regular snapshots for EC2 instances (recommended)

## Security Best Practices
- Principle of least privilege for IAM roles
- Security groups limited to required ports only
- Private subnets for application instances
- No direct public access to data storage
- Encryption in transit and at rest

## Cost Optimization
- Use appropriate instance sizes for each environment
- Auto-scaling to match capacity with demand
- S3 lifecycle policies to manage storage costs
- Reserved instances for production workloads
