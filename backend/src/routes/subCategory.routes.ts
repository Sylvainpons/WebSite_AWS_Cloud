import { Router } from 'express';
import {
  getSubCategoriesByCategory, adminGetAllSubCategories,
  createSubCategory, updateSubCategory, deleteSubCategory,
} from '../controllers/subCategory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/by-category/:categorySlug', getSubCategoriesByCategory);

// Admin
router.get('/admin/all', authenticate, adminGetAllSubCategories);
router.post('/', authenticate, createSubCategory);
router.put('/:id', authenticate, updateSubCategory);
router.delete('/:id', authenticate, deleteSubCategory);

export default router;
