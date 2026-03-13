# ─── Global ───────────────────────────────────────────────────────────────────
variable "aws_region" {
  type    = string
  default = "eu-west-3"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "project" {
  type    = string
  default = "onepiece-encyclopedia"
}

# ─── EC2 / ASG ────────────────────────────────────────────────────────────────
variable "ec2_instance_type" {
  type    = string
  default = "t3.micro"
}

variable "ec2_key_pair_name" {
  description = "Name of your EC2 key pair (create it in AWS Console first)"
  type        = string
}

variable "asg_min_size" {
  type    = number
  default = 1
}

variable "asg_max_size" {
  type    = number
  default = 3
}

variable "asg_desired_capacity" {
  type    = number
  default = 1
}

# ─── RDS ─────────────────────────────────────────────────────────────────────
variable "db_name" {
  type    = string
  default = "onepiece_encyclopedia"
}

variable "db_username" {
  type    = string
  default = "postgres"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for RDS high availability (doubles cost)"
  type        = bool
  default     = false
}

variable "enable_read_replica" {
  description = "Create a read replica (activate when read traffic grows)"
  type        = bool
  default     = false
}

# ─── App ─────────────────────────────────────────────────────────────────────
variable "jwt_secret" {
  type      = string
  sensitive = true
}
