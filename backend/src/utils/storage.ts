import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// ─── Local Storage ───────────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

const ensureUploadDir = (folder: string) => {
  const dir = path.join(UPLOAD_DIR, folder)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

const saveLocally = async (
  buffer: Buffer, originalName: string, folder: string
): Promise<{ url: string; key: string }> => {
  const ext = path.extname(originalName).toLowerCase()
  const filename = `${uuidv4()}${ext}`
  const dir = ensureUploadDir(folder)
  fs.writeFileSync(path.join(dir, filename), buffer)
  const key = `${folder}/${filename}`
  const url = `${process.env.API_URL || 'http://localhost:3001'}/uploads/${key}`
  return { url, key }
}

const deleteLocally = (key: string): void => {
  const filePath = path.join(UPLOAD_DIR, key)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
}

// ─── S3 Storage ──────────────────────────────────────────────────────────────

const getS3Client = () => new S3Client({
  region: process.env.AWS_REGION || 'eu-west-3',
  // Pas de credentials hardcodés — le SDK utilise automatiquement l'IAM role EC2
})

const saveToS3 = async (
  buffer: Buffer, mimeType: string, originalName: string, folder: string
): Promise<{ url: string; key: string }> => {
  const ext = path.extname(originalName).toLowerCase()
  const key = `${folder}/${uuidv4()}${ext}`
  await getS3Client().send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }))
  return { url: `${process.env.S3_BASE_URL}/${key}`, key }
}

const deleteFromS3 = async (key: string): Promise<void> => {
  await getS3Client().send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  }))
}

// ─── Public API ───────────────────────────────────────────────────────────────

const isS3 = () => process.env.STORAGE_DRIVER === 's3'

export const uploadFile = async (
  buffer: Buffer, mimeType: string, originalName: string, folder: string
): Promise<{ url: string; key: string }> => {
  if (isS3()) return saveToS3(buffer, mimeType, originalName, folder)
  return saveLocally(buffer, originalName, folder)
}

export const deleteFile = async (key: string): Promise<void> => {
  if (isS3()) return deleteFromS3(key)
  deleteLocally(key)
}