# Outputs for the storage module

output "frontend_bucket_id" {
  description = "The ID of the frontend bucket"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_bucket_arn" {
  description = "The ARN of the frontend bucket"
  value       = aws_s3_bucket.frontend.arn
}

output "data_bucket_id" {
  description = "The ID of the data bucket"
  value       = aws_s3_bucket.data.id
}

output "data_bucket_arn" {
  description = "The ARN of the data bucket"
  value       = aws_s3_bucket.data.arn
}

output "frontend_bucket_domain_name" {
  description = "The domain name of the frontend bucket"
  value       = aws_s3_bucket.frontend.bucket_regional_domain_name
}
