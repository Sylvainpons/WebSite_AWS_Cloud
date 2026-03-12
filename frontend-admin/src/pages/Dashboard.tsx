import { useEffect, useState } from 'react'
import { Tag, List, Package, TrendingUp } from 'lucide-react'
import api from '../api/client'

interface Stats {
  categories: number
  subCategories: number
  items: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ categories: 0, subCategories: 0, items: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/categories/admin/all'),
      api.get('/subcategories/admin/all'),
      api.get('/items/admin/all?limit=1'),
    ]).then(([cats, subs, items]) => {
      setStats({
        categories: cats.data.length,
        subCategories: subs.data.length,
        items: items.data.pagination?.total || 0,
      })
    }).finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Catégories', value: stats.categories, icon: Tag, color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/20' },
    { label: 'Sous-catégories', value: stats.subCategories, icon: List, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Items', value: stats.items, icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl text-gold-400 font-semibold">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de l'encyclopédie</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-sm">{label}</p>
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${bg}`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-ocean-800 rounded animate-pulse" />
            ) : (
              <p className={`text-3xl font-semibold font-display ${color}`}>{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Quick start guide */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-gold-400" />
          <h2 className="font-semibold text-slate-200">Guide de démarrage</h2>
        </div>
        <ol className="space-y-3">
          {[
            { step: '1', text: 'Créer vos catégories (ex: Jeux Vidéo, Figurines)', done: stats.categories > 0 },
            { step: '2', text: 'Ajouter des sous-catégories à chaque catégorie (ex: PS4, Funko Pop)', done: stats.subCategories > 0 },
            { step: '3', text: 'Ajouter vos premiers items avec images et descriptions', done: stats.items > 0 },
          ].map(({ step, text, done }) => (
            <li key={step} className="flex items-start gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-ocean-800 text-slate-400 border border-ocean-700'
              }`}>
                {done ? '✓' : step}
              </span>
              <p className={`text-sm ${done ? 'text-slate-400 line-through' : 'text-slate-300'}`}>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
