# Outputs for the compute module

output "alb_dns_name" {
  description = "The DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "alb_id" {
  description = "The ID of the load balancer"
  value       = aws_lb.main.id
}

output "frontend_target_group_arn" {
  description = "The ARN of the frontend target group"
  value       = aws_lb_target_group.frontend.arn
}

output "backend_target_group_arn" {
  description = "The ARN of the backend target group"
  value       = aws_lb_target_group.backend.arn
}

output "frontend_asg_name" {
  description = "The name of the frontend autoscaling group"
  value       = aws_autoscaling_group.frontend.name
}

output "backend_asg_name" {
  description = "The name of the backend autoscaling group"
  value       = aws_autoscaling_group.backend.name
}
