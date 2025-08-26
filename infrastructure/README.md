# BookReview Platform Infrastructure

This directory contains the infrastructure as code (Terraform) and containerization (Docker) configurations for the BookReview Platform. The infrastructure is designed to be deployed on AWS and follows a modular approach to support multiple environments.

## Directory Structure

```
infrastructure/
├── terraform/              # Terraform configurations
│   ├── modules/            # Reusable infrastructure modules
│   │   ├── networking/     # VPC, subnets, routing, security groups
│   │   ├── compute/        # EC2, ECS, auto-scaling
│   │   ├── storage/        # S3, EFS
│   │   └── security/       # IAM roles and policies
│   ├── environments/       # Environment-specific configurations
│   │   ├── dev/            # Development environment
│   │   ├── staging/        # Staging environment
│   │   └── prod/           # Production environment
│   └── backend.tf          # Remote state configuration
├── docker/                 # Docker configurations
│   ├── frontend/           # Frontend Dockerfile
│   ├── backend/            # Backend Dockerfile
│   └── docker-compose.yml  # Local development setup
└── docs/                   # Infrastructure documentation
    ├── diagrams/           # Architecture diagrams
    └── guides/             # Setup and troubleshooting guides
```

## Getting Started

### Prerequisites
- AWS CLI configured with appropriate credentials
- Terraform v1.5.0 or later
- Docker and Docker Compose installed

### Setup Instructions
1. Initialize Terraform: `cd terraform/environments/<env> && terraform init`
2. Plan the deployment: `terraform plan -var-file=<env>.tfvars`
3. Apply the configuration: `terraform apply -var-file=<env>.tfvars`

For local development with Docker:
```bash
cd docker
docker-compose up
```

## Documentation
- See the [Architecture Overview](docs/diagrams/architecture.png) for a high-level view
- Refer to [Setup Guide](docs/guides/setup.md) for detailed instructions
