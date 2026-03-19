import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Anchor, X, Menu } from 'lucide-react'

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(query.trim())}`)
      setQuery(''); setSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ocean-800/60 backdrop-blur-md bg-navy-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center">
            <Anchor size={16} className="text-gold-400" />
          </div>
          <span className="font-display text-gold-400 font-semibold text-sm hidden sm:block tracking-wider">
            ONE PIECE ITEMS ENCYCLOPEDIE
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-1.5 text-sm text-slate-400 hover:text-gold-400 transition-colors rounded-lg hover:bg-gold-500/5">
            Accueil
          </Link>
          <Link to="/catalogue" className="px-3 py-1.5 text-sm text-slate-400 hover:text-gold-400 transition-colors rounded-lg hover:bg-gold-500/5">
            Catalogue
          </Link>
        </nav>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-xs justify-end">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher un item..."
                className="flex-1 bg-ocean-900 border border-ocean-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gold-500 placeholder:text-slate-500"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-slate-400 hover:text-gold-400 transition-colors p-2 rounded-lg hover:bg-gold-500/5">
              <Search size={18} />
            </button>
          )}
          <button className="md:hidden text-slate-400 hover:text-slate-200 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-ocean-800 px-4 py-3 space-y-1">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-gold-400 rounded-lg">Accueil</Link>
          <Link to="/catalogue" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-gold-400 rounded-lg">Catalogue</Link>
        </div>
      )}
    </header>
  )
}
