import { Router } from 'express';
import {
  getItems, getItemBySlug,
  adminGetItems, createItem, updateItem, deleteItem,
} from '../controllers/item.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getItems);
router.get('/:slug', getItemBySlug);

// Admin
router.get('/admin/all', authenticate, adminGetItems);
router.post('/', authenticate, createItem);
router.put('/:id', authenticate, updateItem);
router.delete('/:id', authenticate, deleteItem);

export default router;
