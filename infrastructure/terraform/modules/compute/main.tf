# Compute Module for BookReview Platform
# main.tf - EC2 instances and load balancer

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "prod" ? true : false

  tags = merge(
    var.common_tags,
    {
      Name = "${var.environment}-alb"
    }
  )
}

# ALB Target Group for Frontend
resource "aws_lb_target_group" "frontend" {
  name     = "${var.environment}-frontend-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.environment}-frontend-tg"
    }
  )
}

# ALB Target Group for Backend
resource "aws_lb_target_group" "backend" {
  name     = "${var.environment}-backend-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.environment}-backend-tg"
    }
  )
}

# ALB Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# ALB Listener Rule for Backend
resource "aws_lb_listener_rule" "backend" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# Launch Template for Frontend
resource "aws_launch_template" "frontend" {
  name_prefix   = "${var.environment}-frontend-lt-"
  image_id      = var.frontend_ami_id
  instance_type = var.frontend_instance_type
  key_name      = var.key_name

  iam_instance_profile {
    name = var.ec2_instance_profile
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [var.frontend_security_group_id]
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo "Starting frontend application setup"
    # Install Docker
    apt-get update
    apt-get install -y docker.io
    systemctl start docker
    systemctl enable docker
    
    # Pull and run the frontend container
    docker pull ${var.frontend_container_image}
    docker run -d -p 80:80 --name bookreview-frontend ${var.frontend_container_image}
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = merge(
      var.common_tags,
      {
        Name = "${var.environment}-frontend"
      }
    )
  }
}

# Launch Template for Backend
resource "aws_launch_template" "backend" {
  name_prefix   = "${var.environment}-backend-lt-"
  image_id      = var.backend_ami_id
  instance_type = var.backend_instance_type
  key_name      = var.key_name

  iam_instance_profile {
    name = var.ec2_instance_profile
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [var.backend_security_group_id]
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo "Starting backend application setup"
    # Install Docker
    apt-get update
    apt-get install -y docker.io
    systemctl start docker
    systemctl enable docker
    
    # Pull and run the backend container
    docker pull ${var.backend_container_image}
    docker run -d -p 3001:3001 --name bookreview-backend \
      -e AWS_REGION=${var.aws_region} \
      -e S3_BUCKET=${var.s3_bucket_name} \
      ${var.backend_container_image}
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = merge(
      var.common_tags,
      {
        Name = "${var.environment}-backend"
      }
    )
  }
}

# Auto Scaling Group for Frontend
resource "aws_autoscaling_group" "frontend" {
  name                = "${var.environment}-frontend-asg"
  vpc_zone_identifier = var.private_subnet_ids
  min_size            = var.environment == "prod" ? 2 : 1
  max_size            = var.environment == "prod" ? 6 : 3
  desired_capacity    = var.environment == "prod" ? 2 : 1
  
  launch_template {
    id      = aws_launch_template.frontend.id
    version = "$Latest"
  }
  
  target_group_arns = [aws_lb_target_group.frontend.arn]
  
  lifecycle {
    create_before_destroy = true
  }
  
  tag {
    key                 = "Name"
    value               = "${var.environment}-frontend"
    propagate_at_launch = true
  }
  
  dynamic "tag" {
    for_each = var.common_tags
    content {
      key                 = tag.key
      value               = tag.value
      propagate_at_launch = true
    }
  }
}

# Auto Scaling Group for Backend
resource "aws_autoscaling_group" "backend" {
  name                = "${var.environment}-backend-asg"
  vpc_zone_identifier = var.private_subnet_ids
  min_size            = var.environment == "prod" ? 2 : 1
  max_size            = var.environment == "prod" ? 6 : 3
  desired_capacity    = var.environment == "prod" ? 2 : 1
  
  launch_template {
    id      = aws_launch_template.backend.id
    version = "$Latest"
  }
  
  target_group_arns = [aws_lb_target_group.backend.arn]
  
  lifecycle {
    create_before_destroy = true
  }
  
  tag {
    key                 = "Name"
    value               = "${var.environment}-backend"
    propagate_at_launch = true
  }
  
  dynamic "tag" {
    for_each = var.common_tags
    content {
      key                 = tag.key
      value               = tag.value
      propagate_at_launch = true
    }
  }
}
