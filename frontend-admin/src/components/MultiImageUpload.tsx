import { useState, useRef } from 'react'
import { Upload, X, Plus, GripVertical } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

interface MultiImageUploadProps {
  images: string[]
  onChange: (urls: string[]) => void
  folder?: string
}

export default function MultiImageUpload({ images, onChange, folder = 'items' }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    const arr = Array.from(files)
    if (arr.some(f => f.size > 5 * 1024 * 1024)) {
      toast.error('Une image dépasse 5MB')
      return
    }
    setUploading(true)
    try {
      const urls = await Promise.all(arr.map(async (file) => {
        const form = new FormData()
        form.append('image', file)
        form.append('folder', folder)
        const res = await api.post('/upload/image', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        return res.data.url as string
      }))
      onChange([...images, ...urls])
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} ajoutée${urls.length > 1 ? 's' : ''}`)
    } catch {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const remove = (index: number) => {
    const next = [...images]
    next.splice(index, 1)
    onChange(next)
  }

  const moveLeft = (index: number) => {
    if (index === 0) return
    const next = [...images]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onChange(next)
  }

  const moveRight = (index: number) => {
    if (index === images.length - 1) return
    const next = [...images]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{images.length} image{images.length !== 1 ? 's' : ''} · La première est l'image principale</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
        >
          {uploading
            ? <span className="w-3 h-3 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
            : <Plus size={12} />}
          Ajouter
        </button>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-ocean-700">
              {i === 0 && (
                <div className="absolute top-1.5 left-1.5 z-10 bg-gold-500 text-navy-950 text-xs font-bold px-1.5 py-0.5 rounded">
                  Principale
                </div>
              )}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                <div className="flex gap-1">
                  {i > 0 && (
                    <button type="button" onClick={() => moveLeft(i)}
                      className="bg-ocean-800 text-slate-300 rounded p-1 hover:bg-ocean-700 text-xs">
                      ←
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button type="button" onClick={() => moveRight(i)}
                      className="bg-ocean-800 text-slate-300 rounded p-1 hover:bg-ocean-700 text-xs">
                      →
                    </button>
                  )}
                </div>
                <button type="button" onClick={() => remove(i)}
                  className="bg-red-700 text-white rounded px-2 py-1 text-xs flex items-center gap-1">
                  <X size={10} /> Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-28 rounded-lg border-2 border-dashed border-ocean-700 hover:border-gold-500/50 transition-colors flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-gold-400"
        >
          <Upload size={20} />
          <span className="text-xs">Cliquer pour ajouter des images</span>
          <span className="text-xs opacity-60">JPG, PNG, WEBP · max 5MB · multiple</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => e.target.files?.length && handleFiles(e.target.files)}
      />
    </div>
  )
}
