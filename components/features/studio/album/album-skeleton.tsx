export function AlbumItemSkeleton() {
  return (
    <div className="bg-card border border-white/5 rounded-2xl p-4">
      <div className="relative aspect-square rounded-xl mb-4 bg-white/5 animate-pulse" />

      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1 space-y-2.5 mt-1">
          <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
        </div>
        <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse shrink-0 mt-1" />
      </div>
    </div>
  );
}
