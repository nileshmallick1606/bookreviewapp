# Variables for the development environment

variable "environment" {
  description = "The deployment environment"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

# Network Configuration
variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "The CIDR blocks for the public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "The CIDR blocks for the private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "availability_zones" {
  description = "The availability zones to deploy into"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "create_nat_gateway" {
  description = "Whether to create NAT Gateways for private subnets"
  type        = bool
  default     = false  # Set to false for dev to save costs
}

# Compute Configuration
variable "frontend_ami_id" {
  description = "The AMI ID for frontend instances"
  type        = string
  default     = "ami-0c7217cdde317cfec"  # Ubuntu 22.04 LTS in us-east-1
}

variable "backend_ami_id" {
  description = "The AMI ID for backend instances"
  type        = string
  default     = "ami-0c7217cdde317cfec"  # Ubuntu 22.04 LTS in us-east-1
}

variable "frontend_instance_type" {
  description = "The instance type for frontend instances"
  type        = string
  default     = "t3.small"
}

variable "backend_instance_type" {
  description = "The instance type for backend instances"
  type        = string
  default     = "t3.small"  # Smaller instance for dev
}

variable "key_name" {
  description = "The key pair name for SSH access"
  type        = string
  default     = "bookreview-dev-key"
}

# Container Images
variable "frontend_container_image" {
  description = "The Docker image for the frontend application"
  type        = string
  default     = "bookreview/frontend:latest"
}

variable "backend_container_image" {
  description = "The Docker image for the backend application"
  type        = string
  default     = "bookreview/backend:latest"
}

# Storage Configuration
variable "frontend_bucket_name" {
  description = "The name of the S3 bucket for frontend static assets"
  type        = string
  default     = "bookreview-frontend"
}

variable "data_bucket_name" {
  description = "The name of the S3 bucket for application data"
  type        = string
  default     = "bookreview-data"
}

# Common Tags
variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "BookReview"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}
