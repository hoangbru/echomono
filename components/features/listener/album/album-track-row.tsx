"use client";

import { Play, Pause } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import { cn } from "@/utils/helpers";
import { formatDuration } from "@/utils/format";
import { TrackDetail, AlbumDetail } from "@/types";
import { DownloadButton } from "@/components/shared/buttons";

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
  const supabase = createClient();

  const durationInSeconds = track.duration_ms
    ? Math.round(track.duration_ms / 1000)
    : 180;

  const artistName = track.artist_name || album.artist_name || "Unknown Artist";
  const isPlayingVisualizer = isCurrentTrack && isPlaying;

  // Chuẩn bị object theo đúng chuẩn interface Track (use-player)
  const downloadTrack = {
    id: track.id,
    title: track.title,
    artistNames: artistName,
    // Vì bảng tracks đã xóa cột cover_url, ta dùng luôn cover_url của album
    imageUrl: album.cover_url || "/default-cover.jpg",
    audioUrl: supabase.storage
      .from("songs_bucket")
      .getPublicUrl(track.audio_path).data.publicUrl,
    albumId: album.id,
    lyrics: track.lyrics,
    albumTitle: album.title,
  };

  return (
    <div
      className="group grid grid-cols-[40px_1fr_80px] sm:grid-cols-[50px_1fr_90px] md:grid-cols-[50px_minmax(0,2fr)_minmax(0,1fr)_100px] gap-2 md:gap-4 px-2 md:px-4 py-2.5 rounded-lg hover:bg-accent transition-colors items-center cursor-pointer"
      onClick={() => onPlaySingleTrack(track, index)}
    >
      {/* Cột 1: STT / Icon Play / Sóng nhạc */}
      <div className="relative w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
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

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-foreground">
          {isPlayingVisualizer ? (
            <Pause className="w-4 h-4 fill-primary text-primary" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </div>
      </div>

      {/* Cột 2: Tên bài & Ca sĩ (Đã xóa check is_explicit) */}
      <div className="flex flex-col min-w-0 pr-2">
        <span
          className={cn(
            "text-[15px] truncate font-medium",
            isCurrentTrack ? "text-primary" : "text-foreground",
          )}
        >
          {track.title}
        </span>
        <span className="truncate text-[13px] text-muted-foreground mt-0.5">
          {artistName}
        </span>
      </div>

      {/* Cột 3: Trống (Dành cho Lượt nghe, ẩn trên mobile) */}
      <div className="hidden md:block"></div>

      {/* Cột 4: Nút Tải xuống & Thời lượng */}
      <div className="flex items-center justify-end gap-1 md:gap-3 md:pr-4">
        {/* Nút Download chỉ hiện khi Hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <DownloadButton track={downloadTrack} />
        </div>

        {/* Thời lượng */}
        <div className="text-[13px] text-muted-foreground flex justify-end font-medium w-9 md:w-10">
          {formatDuration(durationInSeconds)}
        </div>
      </div>
    </div>
  );
}
