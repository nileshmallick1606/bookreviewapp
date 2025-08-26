# Remote state configuration for Terraform
# This configures the S3 backend for storing Terraform state

terraform {
  backend "s3" {
    bucket         = "bookreview-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
