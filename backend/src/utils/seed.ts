import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'changeme123', 12);
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@onepiece-encyclopedia.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@onepiece-encyclopedia.com',
      password: hashedPassword,
      name: 'Admin',
    },
  });
  console.log('✅ Admin created');

  // Seed categories
  const categories = [
    {
      name: 'Jeux Vidéo', slug: 'jeux-video', description: 'Tous les jeux vidéo One Piece officiels',
      displayOrder: 1,
      subs: [
        { name: 'PlayStation 4', slug: 'ps4' },
        { name: 'PlayStation 5', slug: 'ps5' },
        { name: 'Nintendo Switch', slug: 'switch' },
        { name: 'Xbox', slug: 'xbox' },
        { name: 'PC / Steam', slug: 'pc-steam' },
      ],
    },
    {
      name: 'Figurines', slug: 'figurines', description: 'Figurines officielles One Piece',
      displayOrder: 2,
      subs: [
        { name: 'Funko Pop', slug: 'funko-pop' },
        { name: 'Figuarts Zero', slug: 'figuarts-zero' },
        { name: 'Portrait of Pirates', slug: 'portrait-of-pirates' },
        { name: 'Ichiban Kuji', slug: 'ichiban-kuji' },
      ],
    },
    {
      name: 'Cartes', slug: 'cartes', description: 'Jeux de cartes et cartes à collectionner',
      displayOrder: 3,
      subs: [
        { name: 'One Piece Card Game', slug: 'opcg' },
        { name: 'Panini', slug: 'panini' },
      ],
    },
    {
      name: 'Vêtements', slug: 'vetements', description: 'Vêtements et accessoires officiels',
      displayOrder: 4,
      subs: [
        { name: 'T-Shirts', slug: 't-shirts' },
        { name: 'Sweats', slug: 'sweats' },
        { name: 'Accessoires', slug: 'accessoires' },
      ],
    },
    {
      name: 'Manga & Livres', slug: 'manga-livres', description: 'Volumes et ouvrages officiels',
      displayOrder: 5,
      subs: [
        { name: 'Tomes', slug: 'tomes' },
        { name: 'Artbooks', slug: 'artbooks' },
        { name: 'Vivre Cards', slug: 'vivre-cards' },
      ],
    },
  ];

  for (const cat of categories) {
    const { subs, ...catData } = cat;
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {},
      create: catData,
    });

    for (let i = 0; i < subs.length; i++) {
      await prisma.subCategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: subs[i].slug } },
        update: {},
        create: { ...subs[i], categoryId: category.id, displayOrder: i },
      });
    }
    console.log(`✅ Category "${catData.name}" with ${subs.length} subcategories`);
  }

  console.log('🏴‍☠️  Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
