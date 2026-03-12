import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api/client'
import Modal from '../components/Modal'
import ConfirmDelete from '../components/ConfirmDelete'
import ImageUpload from '../components/ImageUpload'

interface SubCategory {
  id: number; name: string; slug: string; description: string | null
  imageUrl: string | null; displayOrder: number; isActive: boolean
  categoryId: number; category: { id: number; name: string }
  _count?: { items: number }
}
interface Category { id: number; name: string }
interface FormData { name: string; description: string; displayOrder: number; isActive: boolean; categoryId: number }

export default function SubCategories() {
  const [subs, setSubs] = useState<SubCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SubCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubCategory | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [filterCat, setFilterCat] = useState<string>('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const load = () => {
    Promise.all([
      api.get('/subcategories/admin/all'),
      api.get('/categories/admin/all'),
    ]).then(([subRes, catRes]) => {
      setSubs(subRes.data)
      setCategories(catRes.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null); setImageUrl('')
    reset({ name: '', description: '', displayOrder: 0, isActive: true, categoryId: categories[0]?.id })
    setModalOpen(true)
  }

  const openEdit = (sub: SubCategory) => {
    setEditing(sub); setImageUrl(sub.imageUrl || '')
    reset({ name: sub.name, description: sub.description || '', displayOrder: sub.displayOrder, isActive: sub.isActive, categoryId: sub.categoryId })
    setModalOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = { ...data, imageUrl: imageUrl || null }
      if (editing) {
        await api.put(`/subcategories/${editing.id}`, payload)
        toast.success('Sous-catégorie mise à jour')
      } else {
        await api.post('/subcategories', payload)
        toast.success('Sous-catégorie créée')
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
      await api.delete(`/subcategories/${deleteTarget.id}`)
      toast.success('Sous-catégorie supprimée')
      setDeleteTarget(null); load()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Erreur')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = filterCat ? subs.filter(s => s.categoryId === parseInt(filterCat)) : subs

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-gold-400 font-semibold">Sous-catégories</h1>
          <p className="text-slate-500 text-sm mt-1">{subs.length} sous-catégorie{subs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Nouvelle sous-catégorie</button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="input-field w-56"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ocean-800">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Nom</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Catégorie</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Items</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-ocean-800">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-ocean-800 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map(sub => (
              <tr key={sub.id} className="table-row">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {sub.imageUrl ? (
                      <img src={sub.imageUrl} alt="" className="w-7 h-7 rounded object-cover border border-ocean-700" />
                    ) : (
                      <div className="w-7 h-7 rounded bg-ocean-800 border border-ocean-700" />
                    )}
                    <span className="text-sm font-medium text-slate-200">{sub.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs bg-ocean-800 text-slate-300 border border-ocean-700 px-2 py-0.5 rounded">
                    {sub.category.name}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-400">{sub._count?.items ?? 0}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sub.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {sub.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(sub)} className="text-slate-400 hover:text-gold-400 transition-colors p-1.5 rounded-lg hover:bg-gold-500/10">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(sub)} className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Modifier' : 'Nouvelle sous-catégorie'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Catégorie *</label>
              <select className="input-field" {...register('categoryId', { required: true, valueAsNumber: true })}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nom *</label>
              <input className="input-field" placeholder="ex: Funko Pop" {...register('name', { required: 'Nom requis' })} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
              <textarea className="input-field resize-none" rows={2} {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Ordre</label>
                <input type="number" className="input-field" {...register('displayOrder', { valueAsNumber: true })} />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input type="checkbox" id="subIsActive" className="w-4 h-4 accent-gold-500" {...register('isActive')} />
                <label htmlFor="subIsActive" className="text-sm text-slate-300">Actif</label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Image</label>
              <ImageUpload value={imageUrl} onChange={setImageUrl} folder="subcategories" />
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
