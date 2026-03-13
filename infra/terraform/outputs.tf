output "alb_dns_name" {
  description = "ALB DNS — à mettre dans VITE_API_URL"
  value       = "http://${aws_lb.api.dns_name}"
}

output "frontend_url" {
  description = "URL publique du frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "admin_url" {
  description = "URL secrète de l'admin — ne partager qu'avec les personnes autorisées"
  value       = "https://${aws_cloudfront_distribution.admin.domain_name}"
  sensitive   = true
}

output "frontend_cf_distribution_id" {
  description = "ID CloudFront frontend — requis dans GitHub Secrets"
  value       = aws_cloudfront_distribution.frontend.id
}

output "admin_cf_distribution_id" {
  description = "ID CloudFront admin — requis dans GitHub Secrets"
  value       = aws_cloudfront_distribution.admin.id
}

output "frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}

output "admin_bucket" {
  value = aws_s3_bucket.admin.bucket
}

output "images_bucket" {
  value = aws_s3_bucket.images.bucket
}

output "rds_endpoint" {
  value     = aws_db_instance.postgres.endpoint
  sensitive = true
}

output "rds_replica_endpoint" {
  value     = var.enable_read_replica ? aws_db_instance.postgres_replica[0].endpoint : "not enabled"
  sensitive = true
}

output "deploy_summary" {
  value = <<-EOT

    ╔═══════════════════════════════════════════════════════════════╗
    ║        ONE PIECE ENCYCLOPEDIA — INFRASTRUCTURE READY          ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Frontend   : https://${aws_cloudfront_distribution.frontend.domain_name}
    ║  Admin      : https://${aws_cloudfront_distribution.admin.domain_name}
    ║               ↑ URL secrète — partage uniquement avec ton client
    ║  API (ALB)  : http://${aws_lb.api.dns_name}
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Read Replica : ${var.enable_read_replica ? "ACTIVÉE" : "désactivée  →  enable_read_replica=true pour activer"}
    ║  Multi-AZ     : ${var.db_multi_az ? "ACTIVÉ" : "désactivé   →  db_multi_az=true pour activer"}
    ║  Auto Scaling : ${var.asg_min_size}-${var.asg_max_size} instances  (scale up >70% CPU / scale down <20%)
    ╚═══════════════════════════════════════════════════════════════╝

    GitHub Secrets à configurer :
      API_URL                    = http://${aws_lb.api.dns_name}/api
      FRONTEND_BUCKET            = ${aws_s3_bucket.frontend.bucket}
      ADMIN_BUCKET               = ${aws_s3_bucket.admin.bucket}
      FRONTEND_CF_DISTRIBUTION_ID = ${aws_cloudfront_distribution.frontend.id}
      ADMIN_CF_DISTRIBUTION_ID   = ${aws_cloudfront_distribution.admin.id}
  EOT
}
