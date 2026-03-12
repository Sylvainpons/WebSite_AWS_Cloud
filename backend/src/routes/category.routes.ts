import { Router } from 'express';
import {
  getAllCategories, getCategoryBySlug,
  adminGetAllCategories, createCategory, updateCategory, deleteCategory,
} from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);

// Admin (protected)
router.get('/admin/all', authenticate, adminGetAllCategories);
router.post('/', authenticate, createCategory);
router.put('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);

export default router;
