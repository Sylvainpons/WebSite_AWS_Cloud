terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Décommente après le premier apply
  # backend "s3" {
  #   bucket  = "onepiece-terraform-state"
  #   key     = "prod/terraform.tfstate"
  #   region  = "eu-west-3"
  #   encrypt = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
