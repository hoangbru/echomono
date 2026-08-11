import Image from "next/image";
import { Play, Trash2 } from "lucide-react";
import { cn } from "@/utils/helpers";
import { Track } from "@/hooks/use-player";

interface OfflineTrackListProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: Track, index: number) => void;
  onDeleteTrack: (e: React.MouseEvent, track: Track) => void;
}

export function OfflineTrackList({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onDeleteTrack,
}: OfflineTrackListProps) {
  return (
    <div className="flex flex-col gap-1">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrackId === track.id;

        return (
          <div
            key={track.id}
            onClick={() => onPlayTrack(track, index)}
            className="group flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-6 flex items-center justify-center shrink-0 text-muted-foreground font-medium text-sm">
                {isCurrentTrack && isPlaying ? (
                  <div className="flex items-end gap-[2px] h-3">
                    <div className="w-[2px] bg-primary rounded-full h-3 animate-now-playing-bar-1" />
                    <div className="w-[2px] bg-primary rounded-full h-2 animate-now-playing-bar-2" />
                    <div className="w-[2px] bg-primary rounded-full h-3 animate-now-playing-bar-3" />
                  </div>
                ) : (
                  <span className="group-hover:hidden">{index + 1}</span>
                )}
                <Play
                  className={cn(
                    "w-4 h-4 hidden",
                    !isCurrentTrack && "group-hover:block text-foreground",
                  )}
                />
              </div>

              <div className="relative w-10 h-10 rounded shrink-0 overflow-hidden bg-muted">
                <Image
                  src={track.imageUrl}
                  alt={track.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    "font-medium truncate text-[15px]",
                    isCurrentTrack ? "text-primary" : "text-foreground",
                  )}
                >
                  {track.title}
                </span>
                <span className="text-sm text-muted-foreground truncate">
                  {track.artistNames}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => onDeleteTrack(e, track)}
              className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
              title="Xóa bài hát"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
