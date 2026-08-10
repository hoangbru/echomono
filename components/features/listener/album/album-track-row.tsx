// components/features/album/album-track-row.tsx
"use client";

import { Play, Pause } from "lucide-react";

import { cn } from "@/utils/helpers";
import { formatDuration } from "@/utils/format";
import { TrackDetail, AlbumDetail } from "@/types";

interface AlbumTrackRowProps {
  track: TrackDetail;
  index: number;
  album: AlbumDetail;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onPlaySingleTrack: (track: TrackDetail, index: number) => void;
}

export function AlbumTrackRow({
  track,
  index,
  album,
  isCurrentTrack,
  isPlaying,
  onPlaySingleTrack,
}: AlbumTrackRowProps) {
  const durationInSeconds = track.duration_ms
    ? Math.round(track.duration_ms / 1000)
    : 180;
  const artistName = track.artist_name || album.artist_name || "Unknown Artist";

  // Trạng thái visualizer chỉ hiện khi ĐÚNG bài này đang chạy & Player đang Play
  const isPlayingVisualizer = isCurrentTrack && isPlaying;

  return (
    <div
      className="group grid grid-cols-[40px_1fr_40px] sm:grid-cols-[50px_1fr_80px] md:grid-cols-[50px_minmax(0,2fr)_minmax(0,1fr)_100px] gap-2 md:gap-4 px-2 md:px-4 py-2.5 rounded-lg hover:bg-accent transition-colors items-center cursor-pointer"
      onClick={() => onPlaySingleTrack(track, index)} // Chuyển từ onDoubleClick sang onClick cho dễ dùng trên mobile
    >
      {/* Cột 1: STT / Icon Play / Sóng nhạc */}
      <div className="relative w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
        {/* Lớp hiển thị Mặc định (Số thứ tự hoặc Visualizer) -> Bị ẩn khi Hover */}
        <div
          className={cn(
            "group-hover:opacity-0 transition-opacity flex items-center justify-center",
            isCurrentTrack ? "text-primary" : "text-muted-foreground",
          )}
        >
          {isPlayingVisualizer ? (
            <div className="flex items-end gap-[2px] h-3">
              <div className="w-[3px] bg-primary rounded-full h-3 animate-now-playing-bar-1" />
              <div className="w-[3px] bg-primary rounded-full h-2 animate-now-playing-bar-2" />
              <div className="w-[3px] bg-primary rounded-full h-3 animate-now-playing-bar-3" />
            </div>
          ) : (
            track.track_number
          )}
        </div>

        {/* Lớp hiển thị khi Hover (Play / Pause) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-foreground">
          {isPlayingVisualizer ? (
            <Pause className="w-4 h-4 fill-primary text-primary" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </div>
      </div>

      {/* Cột 2: Tên bài & Ca sĩ */}
      <div className="flex flex-col min-w-0 pr-2">
        <span
          className={cn(
            "text-[15px] truncate font-medium",
            isCurrentTrack ? "text-primary" : "text-foreground",
          )}
        >
          {track.title}
        </span>
        <span className="truncate">{artistName}</span>
      </div>

      {/* Cột 4: Thời lượng */}
      <div className="text-[13px] text-muted-foreground flex justify-center md:justify-end md:pr-4 items-center font-medium">
        {formatDuration(durationInSeconds)}
      </div>
    </div>
  );
}
