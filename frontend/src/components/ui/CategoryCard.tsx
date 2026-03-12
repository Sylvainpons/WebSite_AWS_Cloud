import { Link } from 'react-router-dom'
import { Tag, ChevronRight } from 'lucide-react'
import type { Category } from '../../api/client'

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/catalogue?category=${category.slug}`}
      className="group relative bg-ocean-900/60 border border-ocean-700/40 rounded-2xl overflow-hidden
        hover:border-gold-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1"
    >
      {/* Background image */}
      <div className="relative h-36 bg-ocean-800/80 overflow-hidden">
        {category.imageUrl ? (
          <img
            src={category.imageUrl} alt={category.name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={28} className="text-ocean-700" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-900 via-ocean-900/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="px-4 pb-4 -mt-4 relative">
        <h3 className="font-display font-semibold text-gold-400 group-hover:text-gold-300 transition-colors text-base">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-slate-500 text-xs mt-1 line-clamp-2">{category.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-500">
            {category._count.subCategories} sous-catégorie{category._count.subCategories !== 1 ? 's' : ''}
          </span>
          <ChevronRight size={14} className="text-gold-500/50 group-hover:text-gold-400 transition-colors group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}
