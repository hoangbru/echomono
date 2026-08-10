// components/features/listener/album/album-skeleton.tsx
export function AlbumHeroSkeleton() {
  return (
    // Đồng bộ class với AlbumHeroSection thật
    <div className="relative w-full h-[30vh] md:h-[40vh] min-h-[340px] bg-gradient-to-b from-neutral-600/50 to-background px-4 sm:px-6 pt-20 pb-6 flex items-end animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end gap-6 z-10 w-full mt-auto">
        <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-60 lg:h-60 bg-muted rounded-md shadow-2xl shrink-0" />

        <div className="flex flex-col gap-3 w-full max-w-2xl">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-12 md:h-16 lg:h-20 bg-muted rounded w-3/4 my-2" />
          <div className="flex items-center gap-2 flex-wrap w-full mt-2">
            <div className="w-6 h-6 rounded-full bg-muted" />
            <div className="h-4 bg-muted rounded w-28" />
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-4 bg-muted rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlbumCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse bg-card p-4 rounded-xl border border-border">
      <div className="aspect-square w-full bg-muted rounded-lg shadow-md" />
      <div className="h-4 bg-muted rounded w-3/4 mt-2" />
      <div className="h-3 bg-muted rounded w-1/2" />
    </div>
  );
}

export function AlbumPageSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-32">
      <AlbumHeroSkeleton />

      <div className="px-4 sm:px-6 bg-gradient-to-b from-secondary/50 to-background pt-4 min-h-screen">
        <div className="flex items-center gap-4 sm:gap-6 py-6 animate-pulse">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted shadow-xl" />
          <div className="w-32 h-12 rounded-full bg-muted" />
        </div>

        {/* Các dòng track giả */}
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-muted/50 rounded-lg w-full animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
