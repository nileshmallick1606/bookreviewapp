# Variables for the compute module

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "The IDs of the public subnets"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "The IDs of the private subnets"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "The ID of the ALB security group"
  type        = string
}

variable "frontend_security_group_id" {
  description = "The ID of the frontend security group"
  type        = string
}

variable "backend_security_group_id" {
  description = "The ID of the backend security group"
  type        = string
}

variable "ec2_instance_profile" {
  description = "The instance profile for EC2 instances"
  type        = string
}

variable "frontend_ami_id" {
  description = "The AMI ID for frontend instances"
  type        = string
}

variable "backend_ami_id" {
  description = "The AMI ID for backend instances"
  type        = string
}

variable "frontend_instance_type" {
  description = "The instance type for frontend instances"
  type        = string
  default     = "t3.small"
}

variable "backend_instance_type" {
  description = "The instance type for backend instances"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "The key pair name for SSH access"
  type        = string
  default     = ""
}

variable "frontend_container_image" {
  description = "The Docker image for the frontend application"
  type        = string
}

variable "backend_container_image" {
  description = "The Docker image for the backend application"
  type        = string
}

variable "aws_region" {
  description = "The AWS region"
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
