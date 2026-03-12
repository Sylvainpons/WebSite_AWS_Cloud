export function ItemSkeleton() {
  return (
    <div className="bg-ocean-900/60 border border-ocean-700/40 rounded-2xl overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-16 rounded mt-3" />
      </div>
    </div>
  )
}

export function CategorySkeleton() {
  return (
    <div className="bg-ocean-900/60 border border-ocean-700/40 rounded-2xl overflow-hidden">
      <div className="h-36 skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-16 rounded mt-3" />
      </div>
    </div>
  )
}
