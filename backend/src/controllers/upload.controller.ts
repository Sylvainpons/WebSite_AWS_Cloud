import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { uploadFile, deleteFile } from '../utils/storage'

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Only JPG, PNG and WEBP images are allowed'))
}

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: 'No file provided' }); return }
  try {
    const folder = (req.body.folder as string) || 'items'
    const result = await uploadFile(req.file.buffer, req.file.mimetype, req.file.originalname, folder)
    res.json(result)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
}

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  const { key } = req.body
  if (!key) { res.status(400).json({ error: 'Key is required' }); return }
  try {
    await deleteFile(key)
    res.json({ message: 'Image deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' })
  }
}