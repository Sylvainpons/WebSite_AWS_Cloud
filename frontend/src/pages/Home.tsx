import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, ChevronRight } from 'lucide-react'
import { getCategories, getItems, type Category, type Item } from '../api/client'
import CategoryCard from '../components/ui/CategoryCard'
import ItemCard from '../components/ui/ItemCard'
import { CategorySkeleton, ItemSkeleton } from '../components/ui/Skeletons'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [latestItems, setLatestItems] = useState<Item[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [loadingItems, setLoadingItems] = useState(true)

  useEffect(() => {
    getCategories().then(setCategories).finally(() => setLoadingCats(false))
    getItems({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' })
      .then(r => setLatestItems(r.data))
      .finally(() => setLoadingItems(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-ocean-700/20 rounded-full blur-3xl" />
          <div className="absolute top-10 right-10 w-48 h-48 bg-blue-900/20 rounded-full blur-3xl" />
          {/* Decorative lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(30,58,95,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,95,0.08) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-6">
            <Compass size={13} className="text-gold-400" />
            <span className="text-gold-400 text-xs font-medium tracking-wider uppercase">Encyclopédie Officielle</span>
          </div>

          <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl mb-4 leading-none">
            <span className="text-white">ONE PIECE </span>
            <br />
            <br />
            <span className="text-gold-400">ITEM</span>
            <span className="text-gold-400">ENCYCLOPEDIE</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            La référence complète de tous les objets officiels One Piece —
            jeux vidéo, figurines, cartes à collectionner et bien plus.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/catalogue" className="btn-primary text-base px-6 py-3">
              Explorer le catalogue
              <ChevronRight size={18} />
            </Link>
            <Link to="/catalogue?rarity=LEGENDARY" className="btn-outline text-base px-6 py-3">
              Items légendaires
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-gold-400">Catégories</h2>
            <p className="text-slate-500 text-sm mt-0.5">Parcourir par type d'objet</p>
          </div>
          <Link to="/catalogue" className="btn-outline text-sm">
            Tout voir <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {loadingCats
            ? Array.from({ length: 5 }).map((_, i) => <CategorySkeleton key={i} />)
            : categories.map(cat => <CategoryCard key={cat.id} category={cat} />)
          }
        </div>
      </section>

      {/* Latest items */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-gold-400">Derniers ajouts</h2>
            <p className="text-slate-500 text-sm mt-0.5">Items récemment ajoutés à l'encyclopédie</p>
          </div>
          <Link to="/catalogue" className="btn-outline text-sm">
            Tout voir <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loadingItems
            ? Array.from({ length: 8 }).map((_, i) => <ItemSkeleton key={i} />)
            : latestItems.length === 0
              ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-slate-500">Aucun item pour le moment.</p>
                  <p className="text-slate-600 text-sm mt-1">Ajoute des items depuis l'interface admin.</p>
                </div>
              )
              : latestItems.map(item => <ItemCard key={item.id} item={item} />)
          }
        </div>
      </section>
    </div>
  )
}
