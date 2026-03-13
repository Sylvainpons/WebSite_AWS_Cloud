output "api_public_ip" {
  description = "IP fixe de l'EC2 — ne change jamais"
  value       = aws_eip.api.public_ip
}

output "frontend_url" {
  value = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "admin_url" {
  value     = "https://${aws_cloudfront_distribution.admin.domain_name}"
  sensitive = true
}

output "frontend_cf_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}

output "admin_cf_distribution_id" {
  value = aws_cloudfront_distribution.admin.id
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

output "deploy_summary" {
  value = <<-EOT

    ╔══════════════════════════════════════════════════════════════╗
    ║       ONE PIECE ENCYCLOPEDIA — INFRASTRUCTURE READY          ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  Frontend : https://${aws_cloudfront_distribution.frontend.domain_name}
    ║  Admin    : https://${aws_cloudfront_distribution.admin.domain_name}
    ║  API      : http://${aws_eip.api.public_ip}:3001
    ║  SSH      : ssh -i onepiece-key.pem ec2-user@${aws_eip.api.public_ip}
    ╠══════════════════════════════════════════════════════════════╣
    ║  GitHub Secrets :
    ║    API_URL                     = http://${aws_eip.api.public_ip}:3001/api
    ║    FRONTEND_BUCKET             = ${aws_s3_bucket.frontend.bucket}
    ║    ADMIN_BUCKET                = ${aws_s3_bucket.admin.bucket}
    ║    FRONTEND_CF_DISTRIBUTION_ID = ${aws_cloudfront_distribution.frontend.id}
    ║    ADMIN_CF_DISTRIBUTION_ID    = ${aws_cloudfront_distribution.admin.id}
    ╚══════════════════════════════════════════════════════════════╝
  EOT
}
