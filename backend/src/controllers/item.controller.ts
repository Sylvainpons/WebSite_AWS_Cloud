import { Request, Response } from 'express';
import prisma from '../utils/prisma';

const slugify = (text: string): string =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

// PUBLIC - with filtering, search, pagination
export const getItems = async (req: Request, res: Response): Promise<void> => {
  const {
    category,       // category slug
    subCategory,    // subCategory slug
    search,         // text search
    rarity,         // COMMON | UNCOMMON | RARE | EPIC | LEGENDARY
    isLimited,      // true | false
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = '1',
    limit = '20',
  } = req.query;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (rarity) where.rarity = rarity;
  if (isLimited === 'true') where.isLimited = true;

  if (subCategory) {
    where.subCategory = { slug: subCategory };
  } else if (category) {
    where.subCategory = { category: { slug: category } };
  }

  const orderBy: any = {};
  const validSortFields = ['createdAt', 'name', 'releaseYear', 'price', 'rarity'];
  const field = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';
  orderBy[field] = sortOrder === 'asc' ? 'asc' : 'desc';

  try {
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          subCategory: {
            select: { id: true, name: true, slug: true, category: { select: { id: true, name: true, slug: true } } },
          },
          tags: { select: { id: true, name: true } },
        },
      }),
      prisma.item.count({ where }),
    ]);

    res.json({
      data: items,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getItemBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await prisma.item.findUnique({
      where: { slug: req.params.slug, isActive: true },
      include: {
        subCategory: { include: { category: true } },
        tags: true,
      },
    });
    if (!item) { res.status(404).json({ error: 'Item not found' }); return; }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ADMIN CRUD
export const adminGetItems = async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '50', search } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const where: any = {};
  if (search) where.name = { contains: search as string, mode: 'insensitive' };

  try {
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where, skip, take: parseInt(limit as string),
        orderBy: { updatedAt: 'desc' },
        include: { subCategory: { include: { category: { select: { name: true } } } }, tags: true },
      }),
      prisma.item.count({ where }),
    ]);
    res.json({ data: items, pagination: { total, page: parseInt(page as string), limit: parseInt(limit as string) } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createItem = async (req: Request, res: Response): Promise<void> => {
  const { name, description, imageUrl, images, releaseYear, price, currency,
          officialLink, rarity, isLimited, subCategoryId, tags } = req.body;

  if (!name || !subCategoryId) {
    res.status(400).json({ error: 'Name and subCategoryId are required' });
    return;
  }

  try {
    const slug = slugify(name);

    // Upsert tags
    const tagConnections = tags?.length
      ? await Promise.all(
          tags.map((tagName: string) =>
            prisma.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            })
          )
        )
      : [];

    const item = await prisma.item.create({
      data: {
        name, slug, description, imageUrl,
        images: images || [],
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        price: price ? parseFloat(price) : null,
        currency: currency || 'EUR',
        officialLink, rarity: rarity || 'COMMON',
        isLimited: isLimited || false,
        subCategoryId: parseInt(subCategoryId),
        tags: { connect: tagConnections.map(t => ({ id: t.id })) },
      },
      include: { subCategory: true, tags: true },
    });
    res.status(201).json(item);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Item slug already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, imageUrl, images, releaseYear, price, currency,
          officialLink, rarity, isLimited, isActive, subCategoryId, tags } = req.body;

  try {
    const data: any = {
      description, imageUrl,
      ...(images !== undefined && { images }),
      ...(releaseYear !== undefined && { releaseYear: releaseYear ? parseInt(releaseYear) : null }),
      ...(price !== undefined && { price: price ? parseFloat(price) : null }),
      ...(currency && { currency }),
      ...(officialLink !== undefined && { officialLink }),
      ...(rarity && { rarity }),
      ...(isLimited !== undefined && { isLimited }),
      ...(isActive !== undefined && { isActive }),
      ...(subCategoryId && { subCategoryId: parseInt(subCategoryId) }),
    };
    if (name) { data.name = name; data.slug = slugify(name); }

    if (tags !== undefined) {
      const tagConnections = tags.length
        ? await Promise.all(tags.map((tagName: string) =>
            prisma.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } })
          ))
        : [];
      data.tags = { set: tagConnections.map((t: any) => ({ id: t.id })) };
    }

    const item = await prisma.item.update({
      where: { id: parseInt(id) },
      data,
      include: { subCategory: true, tags: true },
    });
    res.json(item);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.item.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Item deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
