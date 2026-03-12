import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api/client'
import Modal from '../components/Modal'
import ConfirmDelete from '../components/ConfirmDelete'
import ImageUpload from '../components/ImageUpload'

interface Item {
  id: number; name: string; slug: string; description: string | null
  imageUrl: string | null; releaseYear: number | null; price: string | null
  rarity: string; isLimited: boolean; isActive: boolean
  subCategoryId: number
  subCategory: { name: string; category: { name: string } }
  tags: { id: number; name: string }[]
}
interface SubCategory { id: number; name: string; category: { name: string } }
interface FormData {
  name: string; description: string; releaseYear: string; price: string
  currency: string; officialLink: string; rarity: string
  isLimited: boolean; isActive: boolean; subCategoryId: number; tags: string
}

const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']
const RARITY_COLORS: Record<string, string> = {
  COMMON: 'text-slate-400 border-slate-600', UNCOMMON: 'text-emerald-400 border-emerald-700',
  RARE: 'text-blue-400 border-blue-700', EPIC: 'text-purple-400 border-purple-700',
  LEGENDARY: 'text-gold-400 border-gold-600',
}

export default function Items() {
  const [items, setItems] = useState<Item[]>([])
  const [subs, setSubs] = useState<SubCategory[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const load = useCallback(() => {
    setLoading(true)
    api.get(`/items/admin/all?page=${page}&limit=20&search=${search}`)
      .then(r => { setItems(r.data.data); setTotal(r.data.pagination.total) })
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { api.get('/subcategories/admin/all').then(r => setSubs(r.data)) }, [])

  const openCreate = () => {
    setEditing(null); setImageUrl('')
    reset({ name: '', description: '', releaseYear: '', price: '', currency: 'EUR', officialLink: '', rarity: 'COMMON', isLimited: false, isActive: true, subCategoryId: subs[0]?.id, tags: '' })
    setModalOpen(true)
  }

  const openEdit = (item: Item) => {
    setEditing(item); setImageUrl(item.imageUrl || '')
    reset({
      name: item.name, description: item.description || '',
      releaseYear: item.releaseYear?.toString() || '', price: item.price || '',
      currency: 'EUR', officialLink: '', rarity: item.rarity,
      isLimited: item.isLimited, isActive: item.isActive,
      subCategoryId: item.subCategoryId,
      tags: item.tags.map(t => t.name).join(', ')
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      const payload = { ...data, imageUrl: imageUrl || null, tags }
      if (editing) {
        await api.put(`/items/${editing.id}`, payload)
        toast.success('Item mis à jour')
      } else {
        await api.post('/items', payload)
        toast.success('Item créé')
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
      await api.delete(`/items/${deleteTarget.id}`)
      toast.success('Item supprimé')
      setDeleteTarget(null); load()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Erreur')
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-gold-400 font-semibold">Items</h1>
          <p className="text-slate-500 text-sm mt-1">{total} item{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Nouvel item</button>
      </div>

      {/* Search */}
      <div className="relative mb-4 w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text" placeholder="Rechercher..."
          className="input-field pl-9"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ocean-800">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Item</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Catégorie</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Rareté</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Prix</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-ocean-800">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-ocean-800 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <Package size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Aucun item trouvé</p>
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.id} className="table-row">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-ocean-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-ocean-800 border border-ocean-700 flex items-center justify-center">
                        <Package size={14} className="text-slate-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-200">{item.name}</p>
                      {item.isLimited && <span className="text-xs text-amber-400">Édition limitée</span>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="text-xs">
                    <p className="text-slate-400">{item.subCategory.category.name}</p>
                    <p className="text-slate-500">{item.subCategory.name}</p>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs border px-2 py-0.5 rounded font-medium bg-transparent ${RARITY_COLORS[item.rarity]}`}>
                    {item.rarity}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-slate-400">
                  {item.price ? `${parseFloat(item.price).toFixed(2)} €` : '—'}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {item.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(item)} className="text-slate-400 hover:text-gold-400 transition-colors p-1.5 rounded-lg hover:bg-gold-500/10">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">Page {page} / {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm disabled:opacity-40">← Précédent</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm disabled:opacity-40">Suivant →</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <Modal title={editing ? 'Modifier l\'item' : 'Nouvel item'} onClose={() => setModalOpen(false)} size="lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Left col */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Nom *</label>
                  <input className="input-field" placeholder="ex: One Piece Odyssey" {...register('name', { required: 'Nom requis' })} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Sous-catégorie *</label>
                  <select className="input-field" {...register('subCategoryId', { required: true, valueAsNumber: true })}>
                    {subs.map(s => <option key={s.id} value={s.id}>{s.category.name} — {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                  <textarea className="input-field resize-none" rows={3} {...register('description')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Année</label>
                    <input type="number" className="input-field" placeholder="2024" {...register('releaseYear')} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Prix (€)</label>
                    <input type="number" step="0.01" className="input-field" placeholder="59.99" {...register('price')} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Rareté</label>
                  <select className="input-field" {...register('rarity')}>
                    {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Tags (séparés par virgule)</label>
                  <input className="input-field" placeholder="luffy, sanji, combat" {...register('tags')} />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-gold-500" {...register('isLimited')} />
                    <span className="text-sm text-slate-300">Édition limitée</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-gold-500" {...register('isActive')} />
                    <span className="text-sm text-slate-300">Actif</span>
                  </label>
                </div>
              </div>
              {/* Right col */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Image principale</label>
                  <ImageUpload value={imageUrl} onChange={setImageUrl} folder="items" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Lien officiel</label>
                  <input type="url" className="input-field" placeholder="https://..." {...register('officialLink')} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-5 mt-4 border-t border-ocean-800">
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
