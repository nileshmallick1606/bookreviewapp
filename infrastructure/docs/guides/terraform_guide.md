# Terraform Infrastructure Guide for BookReview Platform

This document explains the Terraform configuration for the BookReview Platform infrastructure on AWS.

## Overview

The infrastructure for the BookReview Platform is managed using Terraform, enabling Infrastructure as Code (IaC) practices. This approach allows us to version, review, and automate the deployment of our infrastructure components.

## Directory Structure

```
infrastructure/terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── ...
│   └── production/
│       ├── ...
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── security/
│   │   ├── ...
│   ├── compute/
│   │   ├── ...
│   └── storage/
│       ├── ...
└── global/
    └── s3-backend/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

## Module Descriptions

### 1. Networking Module

The networking module creates the foundational network infrastructure for the BookReview Platform.

**Key Components**:
- Virtual Private Cloud (VPC)
- Public and private subnets across multiple availability zones
- Internet Gateway for public internet access
- NAT Gateway for private subnet internet access
- Route tables for traffic management
- Network ACLs for additional security

**Usage**:
```hcl
module "networking" {
  source = "../../modules/networking"
  
  environment         = var.environment
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones  = var.availability_zones
}
```

### 2. Security Module

The security module manages security groups and IAM resources.

**Key Components**:
- Security groups for different services (ALB, EC2, RDS)
- IAM roles for EC2 instances
- IAM policies for service permissions
- KMS keys for encryption

**Usage**:
```hcl
module "security" {
  source = "../../modules/security"
  
  environment     = var.environment
  vpc_id         = module.networking.vpc_id
  app_name       = var.app_name
}
```

### 3. Compute Module

The compute module handles the deployment of EC2 instances, Auto Scaling Groups, and Load Balancers.

**Key Components**:
- Application Load Balancer (ALB)
- Auto Scaling Groups for frontend and backend
- Launch Templates for EC2 instances
- Target Groups and Listeners
- CloudWatch alarms for scaling policies

**Usage**:
```hcl
module "compute" {
  source = "../../modules/compute"
  
  environment      = var.environment
  vpc_id          = module.networking.vpc_id
  public_subnets  = module.networking.public_subnet_ids
  private_subnets = module.networking.private_subnet_ids
  security_groups = module.security.security_group_ids
  instance_type   = var.instance_type
  key_name        = var.key_name
}
```

### 4. Storage Module

The storage module creates and manages S3 buckets, RDS instances, and other storage-related resources.

**Key Components**:
- S3 buckets for static assets and logs
- S3 bucket policies
- CloudFront distribution (optional)
- Object lifecycle policies

**Usage**:
```hcl
module "storage" {
  source = "../../modules/storage"
  
  environment = var.environment
  app_name   = var.app_name
}
```

## Environment Configuration

Each environment (dev, staging, production) has its own configuration to allow for environment-specific settings:

### Development Environment

```hcl
# environments/dev/main.tf
module "networking" {
  source = "../../modules/networking"
  
  environment = "dev"
  vpc_cidr   = "10.0.0.0/16"
  # other variables specific to dev
}

module "security" {
  # ...
}

module "compute" {
  # ...
}

module "storage" {
  # ...
}
```

### Production Environment

```hcl
# environments/production/main.tf
module "networking" {
  source = "../../modules/networking"
  
  environment = "production"
  vpc_cidr   = "10.1.0.0/16"
  # other variables specific to production (more redundancy, larger instances)
}

# ...
```

## State Management

Terraform state is stored remotely in an S3 bucket with state locking via DynamoDB to enable collaboration:

```hcl
terraform {
  backend "s3" {
    bucket         = "bookreview-terraform-state"
    key            = "environments/dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "bookreview-terraform-locks"
  }
}
```

## Deployment Workflow

To apply the infrastructure changes:

1. **Initialize Terraform**:
   ```bash
   cd infrastructure/terraform/environments/dev
   terraform init
   ```

2. **Plan the changes**:
   ```bash
   terraform plan -out=tfplan
   ```

3. **Apply the changes**:
   ```bash
   terraform apply tfplan
   ```

4. **Verify the deployment**:
   ```bash
   terraform output
   ```

## Terraform Best Practices Implemented

1. **Modular Structure**:
   - Reusable modules with clear interfaces
   - Separation of concerns between modules
   - Environment-specific configurations

2. **State Management**:
   - Remote state storage in S3
   - State locking with DynamoDB
   - Separate state files per environment

3. **Security**:
   - No hardcoded credentials
   - Least privilege IAM policies
   - Encryption for sensitive data

4. **Maintainability**:
   - Consistent naming conventions
   - Comprehensive documentation
   - Output variables for important resources

## Common Operations

1. **Adding a new resource**:
   - Add the resource definition to the appropriate module
   - Update variables.tf and outputs.tf as needed
   - Run terraform plan to validate changes

2. **Updating existing resources**:
   - Modify the resource definition
   - Run terraform plan to see the changes
   - Apply changes with terraform apply

3. **Destroying resources**:
   - Use terraform destroy for testing environments only
   - For production, remove resources from code and apply

## Troubleshooting

Common issues and solutions:

1. **State lock issues**:
   ```bash
   terraform force-unlock LOCK_ID
   ```

2. **Resource dependency errors**:
   - Check for circular dependencies
   - Use depends_on attribute when needed

3. **Provider authentication**:
   - Ensure AWS credentials are properly configured
   - Check IAM permissions for the Terraform user
