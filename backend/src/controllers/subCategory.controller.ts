import { Request, Response } from 'express';
import prisma from '../utils/prisma';

const slugify = (text: string): string =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

export const getSubCategoriesByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      where: { category: { slug: req.params.categorySlug }, isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: { _count: { select: { items: true } } },
    });
    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminGetAllSubCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      orderBy: [{ categoryId: 'asc' }, { displayOrder: 'asc' }],
      include: { category: { select: { name: true, id: true } }, _count: { select: { items: true } } },
    });
    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSubCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, imageUrl, displayOrder, categoryId } = req.body;
  if (!name || !categoryId) { res.status(400).json({ error: 'Name and categoryId are required' }); return; }

  try {
    const slug = slugify(name);
    const sub = await prisma.subCategory.create({
      data: { name, slug, description, imageUrl, displayOrder: displayOrder || 0, categoryId: parseInt(categoryId) },
      include: { category: { select: { name: true } } },
    });
    res.status(201).json(sub);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'SubCategory already exists in this category' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateSubCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, imageUrl, displayOrder, isActive, categoryId } = req.body;

  try {
    const data: any = { description, imageUrl, displayOrder, isActive };
    if (name) { data.name = name; data.slug = slugify(name); }
    if (categoryId) data.categoryId = parseInt(categoryId);

    const sub = await prisma.subCategory.update({
      where: { id: parseInt(id) },
      data,
      include: { category: { select: { name: true } } },
    });
    res.json(sub);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'SubCategory not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteSubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.subCategory.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'SubCategory deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'SubCategory not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
