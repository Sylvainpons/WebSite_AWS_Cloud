import { Request, Response } from 'express';
import prisma from '../utils/prisma';

const slugify = (text: string): string =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

// PUBLIC
export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          select: { id: true, name: true, slug: true, imageUrl: true, _count: { select: { items: true } } },
        },
        _count: { select: { subCategories: true } },
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug, isActive: true },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: { _count: { select: { items: true } } },
        },
      },
    });
    if (!category) { res.status(404).json({ error: 'Category not found' }); return; }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ADMIN
export const adminGetAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { _count: { select: { subCategories: true } } },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, imageUrl, displayOrder } = req.body;

  if (!name) { res.status(400).json({ error: 'Name is required' }); return; }

  try {
    const slug = slugify(name);
    const category = await prisma.category.create({
      data: { name, slug, description, imageUrl, displayOrder: displayOrder || 0 },
    });
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, imageUrl, displayOrder, isActive } = req.body;

  try {
    const data: any = { description, imageUrl, displayOrder, isActive };
    if (name) { data.name = name; data.slug = slugify(name); }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Category deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
