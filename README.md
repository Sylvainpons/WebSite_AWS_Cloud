# 🏴‍☠️ One Piece Encyclopedia

Encyclopédie complète des objets officiels One Piece.

## Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Storage | AWS S3 |
| Auth | JWT |
| Deploy | AWS EC2 + RDS + S3 + Nginx |

## Structure

```
one-piece-encyclopedia/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       ← Database schema
│   ├── src/
│   │   ├── controllers/        ← Business logic
│   │   ├── middleware/         ← Auth JWT
│   │   ├── routes/             ← API endpoints
│   │   └── utils/              ← Prisma client + seed
│   ├── Dockerfile
│   └── Dockerfile.dev
├── frontend/                   ← React app (next step)
├── infra/                      ← AWS / Nginx configs (next step)
└── docker-compose.yml
```

## API Endpoints

### Public
```
GET  /api/categories                        → All categories + subcategories
GET  /api/categories/:slug                  → Category detail
GET  /api/subcategories/by-category/:slug   → SubCats of a category
GET  /api/items?category=&subCategory=&search=&rarity=&page=&limit=
GET  /api/items/:slug                       → Item detail
```

### Admin (JWT required)
```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/categories/admin/all
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

GET    /api/subcategories/admin/all
POST   /api/subcategories
PUT    /api/subcategories/:id
DELETE /api/subcategories/:id

GET    /api/items/admin/all
POST   /api/items
PUT    /api/items/:id
DELETE /api/items/:id

POST   /api/upload/image    → Upload to S3
DELETE /api/upload/image    → Delete from S3
```

## Getting started

### 1. Clone & install
```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
```

### 2. Start DB with Docker
```bash
docker-compose up db -d
```

### 3. Run migrations & seed
```bash
cd backend
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Start API
```bash
npm run dev
# API running on http://localhost:3001
```

### 5. Full stack with Docker
```bash
docker-compose up --build
```

## Deployment (AWS)

See `infra/` folder for:
- EC2 setup script
- RDS PostgreSQL configuration
- S3 bucket policy
- Nginx reverse proxy config
- GitHub Actions CI/CD pipeline
