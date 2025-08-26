# Variables for the storage module

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
}

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

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
