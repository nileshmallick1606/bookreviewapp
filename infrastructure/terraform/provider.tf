# AWS Provider configuration
# This sets up the AWS provider for Terraform

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "BookReview"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
}
