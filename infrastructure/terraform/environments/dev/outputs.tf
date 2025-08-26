# Outputs for the development environment

output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.networking.vpc_id
}

output "alb_dns_name" {
  description = "The DNS name of the load balancer"
  value       = module.compute.alb_dns_name
}

output "frontend_bucket_name" {
  description = "The name of the frontend bucket"
  value       = module.storage.frontend_bucket_id
}

output "data_bucket_name" {
  description = "The name of the data bucket"
  value       = module.storage.data_bucket_id
}
