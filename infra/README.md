# Infrastructure — One Piece Encyclopedia

## Architecture

```
Internet
   │
   ├── CloudFront (PriceClass_100) ─── S3 public ──── Frontend
   │
   ├── CloudFront (OAC) ─────────────── S3 privé ──── Admin
   │   URL opaque impossible à deviner + JWT auth
   │
   ├── ALB ──── Auto Scaling Group (1-3 × t3.micro)
   │                 └── Docker : API Express :3001
   │                       ├── RDS PostgreSQL (subnet privé)
   │                       └── S3 images
   │
   └── S3 images (lecture publique)
```

## Sécurité Admin

Protégé par deux couches :
1. **URL secrète CloudFront** — bucket S3 privé, accessible uniquement via OAC. Impossible à deviner.
2. **JWT auth** — même avec l'URL, un login valide est requis.

Tu donnes l'URL à ton client, c'est tout.

## Cost Efficiency (~35-55€/mois)
- t3.micro EC2 + db.t3.micro RDS (free tier eligible)
- Pas de NAT Gateway → économie ~32€/mois
- CloudFront PriceClass_100 (US + Europe)
- Read Replica et Multi-AZ désactivés par défaut

## Déploiement

```bash
# 1. Crée une key pair EC2
aws ec2 create-key-pair --key-name onepiece-key \
  --query 'KeyMaterial' --output text > onepiece-key.pem && chmod 400 onepiece-key.pem

# 2. Crée le repo ECR
aws ecr create-repository --repository-name onepiece-api --region eu-west-3

# 3. Configure les variables
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Édite terraform.tfvars

# 4. Déploie
terraform init && terraform plan && terraform apply

# 5. Récupère les outputs
terraform output deploy_summary
terraform output -raw admin_url   # ← URL secrète à donner au client
```

## GitHub Secrets requis
API_URL, FRONTEND_BUCKET, ADMIN_BUCKET, FRONTEND_CF_DISTRIBUTION_ID,
ADMIN_CF_DISTRIBUTION_ID, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
AWS_REGION, ECR_REGISTRY

## Activer la Read Replica
```hcl
enable_read_replica = true  # dans terraform.tfvars
```
```bash
terraform apply
```

## Détruire l'infra
```bash
aws rds modify-db-instance \
  --db-instance-identifier onepiece-encyclopedia-db-primary \
  --no-deletion-protection --apply-immediately
terraform destroy
```
