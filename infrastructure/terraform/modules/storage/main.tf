# Storage Module for BookReview Platform
# main.tf - S3 buckets and EFS file system

# S3 Bucket for static assets (frontend)
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.environment}-${var.frontend_bucket_name}"

  tags = merge(
    var.common_tags,
    {
      Name = "${var.environment}-${var.frontend_bucket_name}"
    }
  )
}

# Block public access for frontend bucket
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning for frontend bucket
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket for application data (JSON files)
resource "aws_s3_bucket" "data" {
  bucket = "${var.environment}-${var.data_bucket_name}"

  tags = merge(
    var.common_tags,
    {
      Name = "${var.environment}-${var.data_bucket_name}"
    }
  )
}

# Block public access for data bucket
resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning for data bucket
resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Lifecycle Policy for data bucket
resource "aws_s3_bucket_lifecycle_configuration" "data_lifecycle" {
  bucket = aws_s3_bucket.data.id

  rule {
    id     = "backup-transition"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 180
      storage_class = "GLACIER"
    }
  }
}
