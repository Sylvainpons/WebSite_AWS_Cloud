import { Router } from 'express';
import { uploadImage, deleteImage, upload } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/image', authenticate, upload.single('image'), uploadImage);
router.delete('/image', authenticate, deleteImage);

export default router;
