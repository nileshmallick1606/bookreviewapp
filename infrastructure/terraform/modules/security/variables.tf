# Variables for the security module

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "s3_bucket_name" {
  description = "The name of the S3 bucket for application data"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
