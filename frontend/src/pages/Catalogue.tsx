import { useEffect, useState, useCallback } from 'react'
import { useSearchParams,useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { getCategories, getItems, type Category, type Item } from '../api/client'
import ItemCard from '../components/ui/ItemCard'
import { ItemSkeleton } from '../components/ui/Skeletons'

const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']
const RARITY_LABEL: Record<string, string> = {
  COMMON: 'Commun', UNCOMMON: 'Peu commun', RARE: 'Rare', EPIC: 'Épique', LEGENDARY: 'Légendaire',
}
const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Plus récents' },
  { value: 'createdAt-asc', label: 'Plus anciens' },
  { value: 'name-asc', label: 'A → Z' },
  { value: 'name-desc', label: 'Z → A' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
]

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const subCategory = searchParams.get('subCategory') || ''
  const search = searchParams.get('search') || ''
  const rarity = searchParams.get('rarity') || ''
  const isLimited = searchParams.get('isLimited') === 'true'
  const sort = searchParams.get('sort') || 'createdAt-desc'
  const page = parseInt(searchParams.get('page') || '1')

  const [searchInput, setSearchInput] = useState(search)

  const navigate = useNavigate()

  const setFilter = (key: string, value: string | null) => {
  const next = new URLSearchParams(searchParams)
  if (value) next.set(key, value); else next.delete(key)
  next.delete('page')
  navigate(`/catalogue?${next.toString()}`)
}

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    if (p === 1) next.delete('page'); else next.set('page', String(p))
    navigate(`/catalogue?${next.toString()}`)
}

  const selectedCat = categories.find(c => c.slug === category)

  const load = useCallback(() => {
    setLoading(true)
    const [sortBy, sortOrder] = sort.split('-')
    getItems({
      category: category || undefined,
      subCategory: subCategory || undefined,
      search: search || undefined,
      rarity: rarity || undefined,
      isLimited: isLimited || undefined,
      sortBy, sortOrder, page, limit: 24,
    }).then(res => {
      setItems(res.data)
      setTotal(res.pagination.total)
      setTotalPages(res.pagination.totalPages)
    }).finally(() => setLoading(false))
  }, [category, subCategory, search, rarity, isLimited, sort, page])

  useEffect(() => { getCategories().then(setCategories) }, [])
  useEffect(() => { load() }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilter('search', searchInput || null)
  }

  const clearAll = () => navigate('/catalogue')

  const hasActiveFilters = category || subCategory || search || rarity || isLimited

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-gold-400 mb-1">Catalogue</h1>
        <p className="text-slate-500 text-sm">{total} item{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text" value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-ocean-900 border border-ocean-700 text-slate-100 rounded-xl px-3 py-2.5 pl-9 text-sm focus:outline-none focus:border-gold-500 placeholder:text-slate-500"
          />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(''); setFilter('search', null) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={13} />
            </button>
          )}
        </form>

        <select
          value={sort}
          onChange={e => setFilter('sort', e.target.value)}
          className="bg-ocean-900 border border-ocean-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold-500"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn-outline text-sm lg:hidden ${filtersOpen ? 'border-gold-500/40 text-gold-400' : ''}`}
        >
          <SlidersHorizontal size={14} /> Filtres {hasActiveFilters && '•'}
        </button>

        {hasActiveFilters && (
          <button onClick={clearAll} className="text-sm text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
            <X size={13} /> Effacer
          </button>
        )}
      </div>

      <div className="flex gap-6">
        <aside className={`shrink-0 w-56 space-y-6 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Catégorie</h3>
            <div className="space-y-1">
              <button
                onClick={() => { setFilter('category', null); setFilter('subCategory', null) }}
                className={`filter-chip w-full text-left ${!category ? 'filter-chip-active' : 'filter-chip-inactive'}`}
              >
                Toutes
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setFilter('category', cat.slug); setFilter('subCategory', null) }}
                  className={`filter-chip w-full text-left ${category === cat.slug ? 'filter-chip-active' : 'filter-chip-inactive'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {selectedCat && selectedCat.subCategories.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sous-catégorie</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setFilter('subCategory', null)}
                  className={`filter-chip w-full text-left ${!subCategory ? 'filter-chip-active' : 'filter-chip-inactive'}`}
                >
                  Toutes
                </button>
                {selectedCat.subCategories.map(sub => (
                  <button key={sub.id}
                    onClick={() => setFilter('subCategory', sub.slug)}
                    className={`filter-chip w-full text-left ${subCategory === sub.slug ? 'filter-chip-active' : 'filter-chip-inactive'}`}
                  >
                    {sub.name}
                    {sub._count && <span className="ml-auto text-xs opacity-50 float-right">{sub._count.items}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Rareté</h3>
            <div className="space-y-1">
              <button
                onClick={() => setFilter('rarity', null)}
                className={`filter-chip w-full text-left ${!rarity ? 'filter-chip-active' : 'filter-chip-inactive'}`}
              >
                Toutes
              </button>
              {RARITIES.map(r => (
                <button key={r}
                  onClick={() => setFilter('rarity', r)}
                  className={`filter-chip w-full text-left ${rarity === r ? 'filter-chip-active' : 'filter-chip-inactive'}`}
                >
                  {RARITY_LABEL[r]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Édition</h3>
            <button
              onClick={() => setFilter('isLimited', isLimited ? null : 'true')}
              className={`filter-chip w-full text-left ${isLimited ? 'filter-chip-active' : 'filter-chip-inactive'}`}
            >
              Éditions limitées
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <ItemSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-ocean-800 border border-ocean-700 flex items-center justify-center mb-4">
                <Search size={24} className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium mb-1">Aucun résultat</p>
              <p className="text-slate-600 text-sm">Essaie de modifier tes filtres</p>
              <button onClick={clearAll} className="btn-outline text-sm mt-4">Effacer les filtres</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => <ItemCard key={item.id} item={item} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(page - 1)} disabled={page === 1}
                    className="btn-outline text-sm disabled:opacity-30"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-gold-500 text-navy-950' : 'text-slate-400 hover:text-gold-400 hover:bg-gold-500/10'}`}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(page + 1)} disabled={page === totalPages}
                    className="btn-outline text-sm disabled:opacity-30"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
