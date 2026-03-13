#!/bin/bash
set -e
exec > /var/log/onepiece-init.log 2>&1

echo "=== One Piece Encyclopedia - Bootstrap ==="
date

yum update -y
yum install -y docker git nginx

systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

mkdir -p /app

printf "DATABASE_URL=%s\nJWT_SECRET=%s\nNODE_ENV=production\nPORT=3001\nSTORAGE_DRIVER=s3\nAWS_REGION=%s\nS3_BUCKET_NAME=%s\nS3_BASE_URL=%s\n" \
  "${db_url}" \
  "${jwt_secret}" \
  "${s3_region}" \
  "${s3_bucket}" \
  "${s3_base_url}" \
  > /app/.env

chmod 600 /app/.env

cat > /etc/nginx/conf.d/onepiece.conf << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 10M;

    location /api/ {
        proxy_pass         http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://127.0.0.1:3001/health;
    }
}
NGINXEOF

nginx -t && systemctl start nginx && systemctl enable nginx

echo "=== Bootstrap termine ==="
date