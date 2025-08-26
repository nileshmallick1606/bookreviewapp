# Main configuration for the development environment

module "networking" {
  source = "../../modules/networking"

  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  create_nat_gateway   = var.create_nat_gateway
  common_tags          = var.common_tags
}

module "security" {
  source = "../../modules/security"

  environment     = var.environment
  vpc_id          = module.networking.vpc_id
  s3_bucket_name  = "${var.environment}-${var.data_bucket_name}"
  common_tags     = var.common_tags

  depends_on = [module.networking]
}

module "storage" {
  source = "../../modules/storage"

  environment         = var.environment
  frontend_bucket_name = var.frontend_bucket_name
  data_bucket_name    = var.data_bucket_name
  common_tags         = var.common_tags
}

module "compute" {
  source = "../../modules/compute"

  environment               = var.environment
  vpc_id                    = module.networking.vpc_id
  public_subnet_ids         = module.networking.public_subnet_ids
  private_subnet_ids        = module.networking.private_subnet_ids
  alb_security_group_id     = module.security.alb_security_group_id
  frontend_security_group_id = module.security.frontend_security_group_id
  backend_security_group_id  = module.security.backend_security_group_id
  ec2_instance_profile      = module.security.ec2_instance_profile
  frontend_ami_id           = var.frontend_ami_id
  backend_ami_id            = var.backend_ami_id
  frontend_instance_type    = var.frontend_instance_type
  backend_instance_type     = var.backend_instance_type
  key_name                  = var.key_name
  frontend_container_image  = var.frontend_container_image
  backend_container_image   = var.backend_container_image
  aws_region                = var.aws_region
  s3_bucket_name            = module.storage.data_bucket_id
  common_tags               = var.common_tags

  depends_on = [module.networking, module.security, module.storage]
}
