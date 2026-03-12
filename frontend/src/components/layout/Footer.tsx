import { Anchor } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-ocean-800/60 mt-20 py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center">
            <Anchor size={13} className="text-gold-400" />
          </div>
          <span className="font-display text-gold-400/70 text-xs tracking-wider">ONE PIECE ENCYCLOPEDIA</span>
        </div>
        <p className="text-slate-600 text-xs text-center">
          Site non officiel — One Piece © Eiichiro Oda / Shueisha. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
