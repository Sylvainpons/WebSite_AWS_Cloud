import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api/client'
import Modal from '../components/Modal'
import ConfirmDelete from '../components/ConfirmDelete'
import ImageUpload from '../components/ImageUpload'

interface Category {
  id: number; name: string; slug: string; description: string | null
  imageUrl: string | null; displayOrder: number; isActive: boolean
  _count?: { subCategories: number }
}

interface FormData {
  name: string; description: string; displayOrder: number; isActive: boolean
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>()

  const load = () => {
    api.get('/categories/admin/all').then(r => setCategories(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null); setImageUrl(''); reset({ name: '', description: '', displayOrder: 0, isActive: true }); setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat); setImageUrl(cat.imageUrl || '')
    reset({ name: cat.name, description: cat.description || '', displayOrder: cat.displayOrder, isActive: cat.isActive })
    setModalOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = { ...data, imageUrl: imageUrl || null }
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload)
        toast.success('Catégorie mise à jour')
      } else {
        await api.post('/categories', payload)
        toast.success('Catégorie créée')
      }
      setModalOpen(false); load()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/categories/${deleteTarget.id}`)
      toast.success('Catégorie supprimée')
      setDeleteTarget(null); load()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Erreur')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-gold-400 font-semibold">Catégories</h1>
          <p className="text-slate-500 text-sm mt-1">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Nouvelle catégorie</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ocean-800">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Catégorie</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Slug</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Sous-cats</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Ordre</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-ocean-800">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-ocean-800 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : categories.map(cat => (
              <tr key={cat.id} className="table-row">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt="" className="w-8 h-8 rounded object-cover border border-ocean-700" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-ocean-800 border border-ocean-700 flex items-center justify-center">
                        <Tag size={12} className="text-slate-500" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-200">{cat.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">{cat.slug}</td>
                <td className="px-5 py-3.5 text-sm text-slate-400">{cat._count?.subCategories ?? 0}</td>
                <td className="px-5 py-3.5 text-sm text-slate-400">{cat.displayOrder}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cat.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {cat.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(cat)} className="text-slate-400 hover:text-gold-400 transition-colors p-1.5 rounded-lg hover:bg-gold-500/10">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(cat)} className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal title={editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nom *</label>
              <input className="input-field" placeholder="ex: Jeux Vidéo" {...register('name', { required: 'Nom requis' })} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
              <textarea className="input-field resize-none" rows={2} placeholder="Description optionnelle" {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Ordre d'affichage</label>
                <input type="number" className="input-field" {...register('displayOrder', { valueAsNumber: true })} />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input type="checkbox" id="isActive" className="w-4 h-4 accent-gold-500" {...register('isActive')} />
                <label htmlFor="isActive" className="text-sm text-slate-300">Actif</label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Image</label>
              <ImageUpload value={imageUrl} onChange={setImageUrl} folder="categories" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Annuler</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                {saving && <span className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />}
                {editing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDelete name={deleteTarget.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
    </div>
  )
}
