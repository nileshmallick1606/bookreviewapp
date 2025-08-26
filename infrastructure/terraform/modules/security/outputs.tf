# Outputs for the security module

output "alb_security_group_id" {
  description = "The ID of the ALB security group"
  value       = aws_security_group.alb.id
}

output "frontend_security_group_id" {
  description = "The ID of the frontend security group"
  value       = aws_security_group.frontend.id
}

output "backend_security_group_id" {
  description = "The ID of the backend security group"
  value       = aws_security_group.backend.id
}

output "ec2_instance_profile" {
  description = "The instance profile for EC2 instances"
  value       = aws_iam_instance_profile.ec2_profile.name
}
