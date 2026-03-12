import { Trash2 } from 'lucide-react'

interface ConfirmDeleteProps {
  name: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDelete({ name, onConfirm, onCancel, loading }: ConfirmDeleteProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-navy-900 border border-red-800/40 rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-800/40 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h3 className="text-slate-100 font-semibold mb-1">Supprimer ?</h3>
        <p className="text-slate-400 text-sm mb-5">
          <span className="text-slate-200 font-medium">"{name}"</span> sera supprimé définitivement.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="btn-secondary text-sm">Annuler</button>
          <button onClick={onConfirm} disabled={loading} className="bg-red-700 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm disabled:opacity-50 flex items-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
