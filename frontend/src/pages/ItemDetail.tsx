import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ExternalLink, Tag, Calendar, Zap, Package, X, ChevronRight, ZoomIn } from 'lucide-react'
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
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    getItemBySlug(slug)
      .then(data => { setItem(data); setActiveIndex(0) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox || !item) return
    const allImages = [item.imageUrl, ...(item.images || [])].filter(Boolean) as string[]
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') {
        const i = allImages.indexOf(lightbox)
        if (i < allImages.length - 1) setLightbox(allImages[i + 1])
      }
      if (e.key === 'ArrowLeft') {
        const i = allImages.indexOf(lightbox)
        if (i > 0) setLightbox(allImages[i - 1])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, item])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-9 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
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
  const allImages = [item.imageUrl, ...(item.images || [])].filter(Boolean) as string[]
  const currentImage = allImages[activeIndex] || null

  const prevImage = () => setActiveIndex(i => Math.max(0, i - 1))
  const nextImage = () => setActiveIndex(i => Math.min(allImages.length - 1, i + 1))

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
        {/* Image gallery */}
        <div className="space-y-3">
          {/* Main image */}
          <div className={`relative aspect-square rounded-2xl overflow-hidden border border-ocean-700/40 shadow-2xl ${rarity.glow} group cursor-zoom-in`}
            onClick={() => currentImage && setLightbox(currentImage)}>
            {currentImage ? (
              <img src={currentImage} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
            {currentImage && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={16} />
              </div>
            )}
            {/* Nav arrows on main image */}
            {allImages.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); prevImage() }} disabled={activeIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 disabled:opacity-20 hover:bg-black/70 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={e => { e.stopPropagation(); nextImage() }} disabled={activeIndex === allImages.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 disabled:opacity-20 hover:bg-black/70 transition-colors">
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setActiveIndex(i) }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? 'bg-gold-400 w-3' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveIndex(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeIndex ? 'border-gold-400' : 'border-ocean-700 opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Link to={`/catalogue?category=${item.subCategory.category.slug}`}
              className="text-xs bg-ocean-800 border border-ocean-700 text-slate-400 hover:text-gold-400 px-2.5 py-1 rounded-lg transition-colors">
              {item.subCategory.category.name}
            </Link>
            <span className="text-slate-600 text-xs">·</span>
            <Link to={`/catalogue?category=${item.subCategory.category.slug}&subCategory=${item.subCategory.slug}`}
              className="text-xs bg-ocean-800 border border-ocean-700 text-slate-400 hover:text-gold-400 px-2.5 py-1 rounded-lg transition-colors">
              {item.subCategory.name}
            </Link>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">{item.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className={`text-sm border px-3 py-1 rounded-full font-medium ${rarity.chip}`}>{rarity.label}</span>
          </div>

          {item.description && (
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{item.description}</p>
          )}

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

          {item.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <Tag size={13} className="text-slate-500" />
              {item.tags.map(tag => (
                <Link key={tag.id} to={`/catalogue?search=${tag.name}`}
                  className="text-xs bg-ocean-800/80 border border-ocean-700 text-slate-400 hover:text-gold-400 hover:border-gold-500/30 px-2.5 py-1 rounded-lg transition-colors">
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

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

      {/* Lightbox */}
      {lightbox && item && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>

          {/* Prev */}
          {allImages.indexOf(lightbox) > 0 && (
            <button className="absolute left-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
              onClick={e => { e.stopPropagation(); setLightbox(allImages[allImages.indexOf(lightbox) - 1]) }}>
              <ChevronLeft size={28} />
            </button>
          )}

          <img
            src={lightbox}
            alt={item.name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          {allImages.indexOf(lightbox) < allImages.length - 1 && (
            <button className="absolute right-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
              onClick={e => { e.stopPropagation(); setLightbox(allImages[allImages.indexOf(lightbox) + 1]) }}>
              <ChevronRight size={28} />
            </button>
          )}

          <div className="absolute bottom-4 text-white/50 text-sm">
            {allImages.indexOf(lightbox) + 1} / {allImages.length} · Échap pour fermer
          </div>
        </div>
      )}
    </div>
  )
}
