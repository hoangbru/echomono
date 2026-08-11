import { ChevronLeft, Play } from "lucide-react";
import { cn } from "@/utils/helpers";

interface OfflineControlsProps {
  viewMode: "tracks" | "albums";
  setViewMode: (mode: "tracks" | "albums") => void;
  selectedAlbumId: string | null;
  setSelectedAlbumId: (id: string | null) => void;
  onPlayAll: () => void;
  hasTracksToPlay: boolean;
}

export function OfflineControls({
  viewMode,
  setViewMode,
  selectedAlbumId,
  setSelectedAlbumId,
  onPlayAll,
  hasTracksToPlay,
}: OfflineControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {selectedAlbumId ? (
          <button
            onClick={() => setSelectedAlbumId(null)}
            className="flex items-center gap-2 text-sm font-bold bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại Album
          </button>
        ) : (
          <>
            <button
              onClick={() => setViewMode("albums")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
                viewMode === "albums"
                  ? "bg-primary text-black"
                  : "bg-secondary text-foreground hover:bg-secondary/80",
              )}
            >
              Album
            </button>
            <button
              onClick={() => setViewMode("tracks")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
                viewMode === "tracks"
                  ? "bg-primary text-black"
                  : "bg-secondary text-foreground hover:bg-secondary/80",
              )}
            >
              Tất cả bài hát
            </button>
          </>
        )}
      </div>

      {(viewMode === "tracks" || selectedAlbumId) && hasTracksToPlay && (
        <button
          onClick={onPlayAll}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-lg hover:scale-105"
        >
          <Play className="w-4 h-4 fill-black" />
          {selectedAlbumId ? "Phát toàn bộ Album" : "Phát tất cả"}
        </button>
      )}
    </div>
  );
}
