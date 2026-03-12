import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
}

export default function ImageUpload({ value, onChange, folder = 'items' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop lourde (max 5MB)'); return }

    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      form.append('folder', folder)
      const res = await api.post('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onChange(res.data.url)
      toast.success('Image uploadée')
    } catch {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group w-full h-40 rounded-lg overflow-hidden border border-ocean-700">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-gold-500 text-navy-950 rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
            >
              <Upload size={12} /> Changer
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
            >
              <X size={12} /> Retirer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-lg border-2 border-dashed border-ocean-700 hover:border-gold-500/50 transition-colors flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-gold-400"
        >
          {uploading ? (
            <span className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          ) : (
            <>
              <ImageIcon size={24} />
              <span className="text-xs">Cliquer pour uploader</span>
              <span className="text-xs opacity-60">JPG, PNG, WEBP · max 5MB</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  )
}
