import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Tag, List, Package, LogOut, Anchor } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/categories', icon: Tag, label: 'Catégories' },
  { to: '/subcategories', icon: List, label: 'Sous-catégories' },
  { to: '/items', icon: Package, label: 'Items' },
]

export default function Sidebar() {
  const { admin, logout } = useAuth()

  return (
    <aside className="w-60 min-h-screen bg-navy-900 border-r border-ocean-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-ocean-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
            <Anchor size={18} className="text-gold-400" />
          </div>
          <div>
            <p className="font-display text-gold-400 text-sm font-semibold leading-tight">ONE PIECE</p>
            <p className="text-slate-500 text-xs">Encyclopedia Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-800/60'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-ocean-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-ocean-700 border border-ocean-600 flex items-center justify-center text-xs font-semibold text-gold-400">
            {admin?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{admin?.name}</p>
            <p className="text-xs text-slate-500 truncate">{admin?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-danger w-full justify-center text-xs">
          <LogOut size={13} /> Déconnexion
        </button>
      </div>
    </aside>
  )
}
