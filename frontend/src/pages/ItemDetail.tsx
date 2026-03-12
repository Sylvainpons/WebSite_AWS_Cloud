import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ExternalLink, Tag, Calendar, Zap, Package } from 'lucide-react'
import { getItemBySlug, type Item } from '../api/client'

const RARITY_STYLES: Record<string, { chip: string; glow: string; label: string }> = {
  COMMON:    { chip: 'rarity-common',    glow: 'shadow-slate-500/10',   label: 'Commun' },
  UNCOMMON:  { chip: 'rarity-uncommon',  glow: 'shadow-emerald-500/15', label: 'Peu commun' },
  RARE:      { chip: 'rarity-rare',      glow: 'shadow-blue-500/20',    label: 'Rare' },
  EPIC:      { chip: 'rarity-epic',      glow: 'shadow-purple-500/25',  label: 'Épique' },
  LEGENDARY: { chip: 'rarity-legendary', glow: 'shadow-gold-500/30',    label: 'Légendaire' },
}

export default function ItemDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    getItemBySlug(slug)
      .then(setItem)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-9 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-4 w-4/6 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <Package size={40} className="text-slate-600 mb-4" />
        <h2 className="font-display text-xl text-slate-300 mb-2">Item introuvable</h2>
        <p className="text-slate-500 mb-6">Cet item n'existe pas ou a été supprimé.</p>
        <button onClick={() => navigate(-1)} className="btn-outline text-sm">
          <ChevronLeft size={14} /> Retour
        </button>
      </div>
    )
  }

  const rarity = RARITY_STYLES[item.rarity]

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link to="/" className="hover:text-gold-400 transition-colors">Accueil</Link>
        <span>/</span>
        <Link to="/catalogue" className="hover:text-gold-400 transition-colors">Catalogue</Link>
        <span>/</span>
        <Link to={`/catalogue?category=${item.subCategory.category.slug}`} className="hover:text-gold-400 transition-colors">
          {item.subCategory.category.name}
        </Link>
        <span>/</span>
        <span className="text-slate-400">{item.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className={`relative aspect-square rounded-2xl overflow-hidden border border-ocean-700/40 shadow-2xl ${rarity.glow}`}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-ocean-800 flex items-center justify-center">
              <Package size={48} className="text-slate-600" />
            </div>
          )}
          {item.isLimited && (
            <div className="absolute top-3 left-3 bg-amber-500 text-navy-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Zap size={11} /> Édition Limitée
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Category path */}
          <div className="flex items-center gap-2 mb-3">
            <Link
              to={`/catalogue?category=${item.subCategory.category.slug}`}
              className="text-xs bg-ocean-800 border border-ocean-700 text-slate-400 hover:text-gold-400 px-2.5 py-1 rounded-lg transition-colors"
            >
              {item.subCategory.category.name}
            </Link>
            <span className="text-slate-600 text-xs">·</span>
            <Link
              to={`/catalogue?category=${item.subCategory.category.slug}&subCategory=${item.subCategory.slug}`}
              className="text-xs bg-ocean-800 border border-ocean-700 text-slate-400 hover:text-gold-400 px-2.5 py-1 rounded-lg transition-colors"
            >
              {item.subCategory.name}
            </Link>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
            {item.name}
          </h1>

          {/* Rarity */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-sm border px-3 py-1 rounded-full font-medium ${rarity.chip}`}>
              {rarity.label}
            </span>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{item.description}</p>
          )}

          {/* Details */}
          <div className="space-y-3 mb-6">
            {item.releaseYear && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={15} className="text-slate-500 shrink-0" />
                <span className="text-slate-400">Année de sortie :</span>
                <span className="text-slate-200 font-medium">{item.releaseYear}</span>
              </div>
            )}
            {item.price && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 shrink-0 w-[15px] text-center font-semibold">€</span>
                <span className="text-slate-400">Prix indicatif :</span>
                <span className="text-gold-400 font-semibold text-base">{parseFloat(item.price).toFixed(2)} €</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <Tag size={13} className="text-slate-500" />
              {item.tags.map(tag => (
                <Link
                  key={tag.id}
                  to={`/catalogue?search=${tag.name}`}
                  className="text-xs bg-ocean-800/80 border border-ocean-700 text-slate-400 hover:text-gold-400 hover:border-gold-500/30 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-auto pt-2">
            {item.officialLink && (
              <a href={item.officialLink} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 justify-center">
                Site officiel <ExternalLink size={14} />
              </a>
            )}
            <button onClick={() => navigate(-1)} className="btn-outline flex-1 justify-center">
              <ChevronLeft size={14} /> Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
