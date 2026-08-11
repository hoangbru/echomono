import Image from "next/image";
import { Disc3, Trash2 } from "lucide-react";

interface DownloadedAlbum {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  trackCount: number;
}

interface OfflineAlbumGridProps {
  albums: DownloadedAlbum[];
  onSelectAlbum: (id: string) => void;
  onDeleteAlbum: (e: React.MouseEvent, id: string) => void;
}

export function OfflineAlbumGrid({
  albums,
  onSelectAlbum,
  onDeleteAlbum,
}: OfflineAlbumGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {albums.map((alb) => (
        <div
          key={alb.id}
          onClick={() => onSelectAlbum(alb.id)}
          className="group bg-card p-4 rounded-xl border border-border/10 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-md bg-muted">
            <Image
              src={alb.imageUrl}
              alt={alb.title}
              fill
              className="object-cover"
            />
            <button
              onClick={(e) => onDeleteAlbum(e, alb.id)}
              className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur-md"
              title="Xóa Album này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <h3 className="font-bold text-foreground truncate text-[15px]">
            {alb.title}
          </h3>
          <p className="text-muted-foreground text-sm truncate mt-1">
            {alb.artist}
          </p>
          <p className="text-primary text-[12px] font-medium flex items-center gap-1 mt-2">
            <Disc3 className="w-3 h-3" /> {alb.trackCount} bài hát
          </p>
        </div>
      ))}
    </div>
  );
}
