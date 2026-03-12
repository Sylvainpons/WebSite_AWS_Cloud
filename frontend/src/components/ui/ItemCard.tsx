import { Link } from 'react-router-dom'
import { Package, Zap } from 'lucide-react'
import type { Item } from '../../api/client'

const RARITY_CLASS: Record<string, string> = {
  COMMON: 'rarity-common', UNCOMMON: 'rarity-uncommon',
  RARE: 'rarity-rare', EPIC: 'rarity-epic', LEGENDARY: 'rarity-legendary',
}

const RARITY_LABEL: Record<string, string> = {
  COMMON: 'Commun', UNCOMMON: 'Peu commun', RARE: 'Rare', EPIC: 'Épique', LEGENDARY: 'Légendaire',
}

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link to={`/item/${item.slug}`} className="card-item group block">
      {/* Image */}
      <div className="relative aspect-square bg-ocean-800/60 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl} alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-slate-600" />
          </div>
        )}

        {/* Rarity badge */}
        <div className={`absolute top-2 right-2 text-xs border px-2 py-0.5 rounded-full font-medium backdrop-blur-sm ${RARITY_CLASS[item.rarity]}`}>
          {RARITY_LABEL[item.rarity]}
        </div>

        {/* Limited badge */}
        {item.isLimited && (
          <div className="absolute top-2 left-2 bg-amber-500/90 text-navy-950 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Zap size={10} /> Limité
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-slate-500 mb-1">
          {item.subCategory.category.name} · {item.subCategory.name}
        </p>
        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-gold-400 transition-colors line-clamp-2 mb-2">
          {item.name}
        </h3>
        <div className="flex items-center justify-between">
          {item.price ? (
            <span className="text-gold-400 font-semibold text-sm">
              {parseFloat(item.price).toFixed(2)} €
            </span>
          ) : (
            <span className="text-slate-600 text-xs">Prix N/A</span>
          )}
          {item.releaseYear && (
            <span className="text-slate-600 text-xs">{item.releaseYear}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
