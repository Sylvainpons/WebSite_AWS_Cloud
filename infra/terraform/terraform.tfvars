# Copie ce fichier : cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars est dans le .gitignore — NE JAMAIS COMMITER

# ─── Global ───────────────────────────────────────────────────────────────────
aws_region  = "eu-west-3"
environment = "prod"
project     = "onepiece-encyclopedia"

# ─── EC2 ─────────────────────────────────────────────────────────────────────
ec2_instance_type    = "t3.micro"      # Free tier eligible
ec2_key_pair_name    = "onepiece-key"  # Nom de ta key pair dans AWS Console

asg_min_size         = 1
asg_max_size         = 3
asg_desired_capacity = 1

# ─── RDS ─────────────────────────────────────────────────────────────────────
db_name           = "onepiece_encyclopedia"
db_username       = "postgres"
db_password       = "CHANGE_ME_MOT_DE_PASSE_FORT"  # Min 12 caractères
db_instance_class = "db.t3.micro"                   # Free tier eligible

# Désactivés par défaut → activer quand le trafic le justifie
enable_read_replica = false  # true = +~15€/mois
db_multi_az         = false  # true = double le prix RDS

# ─── App ─────────────────────────────────────────────────────────────────────
# Génère avec : node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
jwt_secret = "14181d3807679f3998afd5c3d0e686d4b45fdb1efa0bc5210188f5f93ee986d260c935ed6f7fd711f5aa9212f466aab91c1a5eae17ab1cfdb180596377ff1ab7"
