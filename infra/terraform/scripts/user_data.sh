#!/bin/bash
set -e
exec > /var/log/onepiece-init.log 2>&1

echo "=== One Piece Encyclopedia — EC2 Bootstrap ==="
date

# ─── System ───────────────────────────────────────────────────────────────────
yum update -y
yum install -y docker git nginx

systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Docker Compose
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ─── Env file API ─────────────────────────────────────────────────────────────
mkdir -p /app
cat > /app/.env << ENVEOF
DATABASE_URL=${db_url}
JWT_SECRET=${jwt_secret}
NODE_ENV=production
PORT=3001
STORAGE_DRIVER=s3
AWS_REGION=${s3_region}
S3_BUCKET_NAME=${s3_bucket}
S3_BASE_URL=${s3_base_url}
ENVEOF

chmod 600 /app/.env

# ─── Nginx — proxy vers l'API Docker ─────────────────────────────────────────
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

echo "=== Bootstrap terminé — en attente du déploiement GitHub Actions ==="
date
