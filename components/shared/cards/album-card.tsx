"use client";

import { useState, MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Pause, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";
import { AlbumDetail } from "@/types";
import { usePlayer, Track } from "@/hooks/use-player";
import { createClient } from "@/utils/supabase/client";

interface AlbumCardProps {
  album: AlbumDetail;
}

export function AlbumCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 border border-border/50 h-full flex flex-col animate-pulse">
      <div className="relative mb-4 aspect-square rounded-lg bg-muted/50 w-full" />
      <div className="flex-1 flex flex-col gap-2 mt-1">
        <div className="h-4 bg-muted/50 rounded w-4/5" />
        <div className="h-3 bg-muted/50 rounded w-3/5 mt-1" />
      </div>
    </div>
  );
}

export function AlbumCard({ album }: AlbumCardProps) {
  const supabase = createClient();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  // Kiểm tra xem album này có đang phát nhạc hay không
  // (Dựa vào việc bài hát hiện tại có thuộc album này không)
  const isThisAlbumPlayingInContext = false; // Bạn có thể tinh chỉnh logic này theo store player nếu cần
  const showVisualizer = isThisAlbumPlayingInContext && isPlaying;
  const showPausedState = isThisAlbumPlayingInContext && !isPlaying;

  // Xử lý khi bấm nút Play trên card album
  const handlePlay = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Ngăn chặn sự kiện chuyển trang của thẻ Link
    e.stopPropagation();

    try {
      setIsLoadingTracks(true);

      // 1. Lấy danh sách bài hát thuộc album này từ Supabase
      const { data: tracks, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("album_id", album.id)
        .order("track_number", { ascending: true });

      if (error) throw new Error(error.message);
      if (!tracks || tracks.length === 0) {
        toast.error("Album này chưa có bài hát nào!");
        return;
      }

      // 2. Format danh sách bài hát sang định dạng Track của Player
      const formattedTracks: Track[] = tracks.map((track: any) => ({
        id: track.id,
        title: track.title,
        artistNames: track.artist_name || album.artist_name || "Unknown Artist",
        albumId: album.id,
        imageUrl: track.cover_url || album.cover_url || "/default-cover.jpg",
        audioUrl: supabase.storage
          .from("songs_bucket")
          .getPublicUrl(track.audio_path).data.publicUrl,
        lyrics: track.lyrics,
      }));

      // 3. Phát bài đầu tiên trong album
      playTrack(formattedTracks[0], formattedTracks);
    } catch (err: any) {
      toast.error(err.message || "Không thể phát album này.");
    } finally {
      setIsLoadingTracks(false);
    }
  };

  return (
    <Link href={`/album/${album.id}`}>
      <div
        className="bg-card rounded-xl p-4 border border-border/50 hover:border-primary/40 hover:bg-accent transition-all duration-300 group cursor-pointer h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Album Cover Area */}
        <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-muted">
          {album.cover_url ? (
            <Image
              src={album.cover_url}
              alt={album.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
              <div className="text-4xl text-muted-foreground/50">🎵</div>
            </div>
          )}

          {showVisualizer && !isHovered && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <div className="flex items-end gap-[3px] h-6">
                <div className="w-1 bg-primary rounded-full h-5 animate-now-playing-bar-1" />
                <div className="w-1 bg-primary rounded-full h-3 animate-now-playing-bar-2" />
                <div className="w-1 bg-primary rounded-full h-6 animate-now-playing-bar-3" />
                <div className="w-1 bg-primary rounded-full h-4 animate-now-playing-bar-1" />
              </div>
            </div>
          )}

          {showPausedState && !isHovered && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 text-primary">
              <div className="flex items-end gap-[3px] h-6">
                <div className="w-1 bg-current rounded-full h-3" />
                <div className="w-1 bg-current rounded-full h-5" />
                <div className="w-1 bg-current rounded-full h-2" />
              </div>
            </div>
          )}

          {isHovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] transition-all duration-300 z-10">
              <Button
                onClick={handlePlay}
                disabled={isLoadingTracks}
                className="bg-primary hover:bg-primary/90 rounded-full p-3 shadow-lg shadow-primary/60 text-white"
              >
                {isLoadingTracks ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : showVisualizer ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current translate-x-[2px]" />
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1">
          <p
            className={cn(
              "font-semibold text-sm text-foreground truncate group-hover:text-primary transition",
              isThisAlbumPlayingInContext && "text-primary",
            )}
          >
            {album.title}
          </p>
          <p className="text-xs text-muted-foreground truncate hover:text-primary transition mt-1">
            {album.artist_name || "Unknown Artist"}
          </p>
        </div>
      </div>
    </Link>
  );
}
