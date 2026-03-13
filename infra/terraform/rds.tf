# ─── Subnet Group ─────────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  tags       = { Name = "${var.project}-db-subnet-group" }
}

# ─── RDS Primary ──────────────────────────────────────────────────────────────
resource "aws_db_instance" "postgres" {
  identifier     = "${var.project}-db-primary"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az            = var.db_multi_az
  publicly_accessible = false

  backup_retention_period   = 0
  maintenance_window        = "Mon:04:00-Mon:05:00"

  performance_insights_enabled = true

  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project}-final-snapshot"

  tags = { Name = "${var.project}-db-primary" }
}

# ─── Read Replica (optionnel) ─────────────────────────────────────────────────
resource "aws_db_instance" "postgres_replica" {
  count = var.enable_read_replica ? 1 : 0

  identifier          = "${var.project}-db-replica"
  replicate_source_db = aws_db_instance.postgres.identifier
  instance_class      = var.db_instance_class
  storage_type        = "gp3"

  availability_zone      = "${var.aws_region}b"
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period      = 0
  skip_final_snapshot          = true
  multi_az                     = false
  publicly_accessible          = false
  performance_insights_enabled = true

  tags = { Name = "${var.project}-db-replica" }
}