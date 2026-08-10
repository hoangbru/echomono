// components/features/album/album-track-list.tsx
"use client";

import { Clock } from "lucide-react";
import { AlbumTrackRow } from "./album-track-row";

import { AlbumDetail, TrackDetail } from "@/types";
import { usePlayer, Track } from "@/hooks/use-player";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function AlbumTrackList({
  album,
  tracks,
}: {
  album: AlbumDetail;
  tracks: TrackDetail[];
}) {
  const supabase = createClient();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const handlePlaySingleTrack = (track: TrackDetail, index: number) => {
    try {
      // 1. NẾU CLICK VÀO ĐÚNG BÀI ĐANG CHỌN -> Tạm dừng / Phát tiếp
      if (currentTrack?.id === track.id) {
        togglePlay();
        return;
      }

      // 2. NẾU CLICK BÀI KHÁC -> Format list & Phát từ đầu
      const formattedTracks: Track[] = tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artistNames: t.artist_name || album.artist_name || "Unknown Artist",
        albumId: album.id,
        // SỬA LỖI 1: Xóa t.cover_url vì không còn tồn tại, lấy thẳng từ album
        imageUrl: album.cover_url || "/default-cover.jpg",
        audioUrl: supabase.storage
          .from("songs_bucket")
          .getPublicUrl(t.audio_path).data.publicUrl,
        lyrics: t.lyrics,
      }));

      playTrack(formattedTracks[index], formattedTracks);
    } catch (error: any) {
      toast.error("Không thể phát bài hát này.");
    }
  };

  return (
    <div className="mt-4">
      {/* SỬA LỖI 2: Copy y chang class grid-cols từ AlbumTrackRow sang đây để 2 thằng căn lề thẳng tắp */}
      <div className="grid grid-cols-[40px_1fr_80px] sm:grid-cols-[50px_1fr_90px] md:grid-cols-[50px_minmax(0,2fr)_minmax(0,1fr)_100px] gap-2 md:gap-4 px-2 md:px-4 py-2 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        <div className="text-center">#</div>
        <div>Tiêu đề</div>

        {/* Cột 3 trống để dành cho Desktop giống hệt với Row */}
        <div className="hidden md:block"></div>

        <div className="flex justify-end md:pr-4">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      <div className="flex flex-col gap-0.5 md:gap-1">
        {tracks.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            Chưa có bài hát nào phù hợp.
          </div>
        ) : (
          tracks.map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id;

            return (
              <AlbumTrackRow
                key={track.id}
                track={track}
                index={index}
                album={album}
                isCurrentTrack={isCurrentTrack}
                isPlaying={isPlaying}
                onPlaySingleTrack={handlePlaySingleTrack}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
