// components/features/album/album-container.tsx (hoặc đường dẫn tương ứng)
"use client";

import { useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { AlbumTrackList } from "./album-track-list";
import { AlbumHeroSection } from "./album-hero-section";
import { AlbumCard } from "@/components/shared/cards";
import { AlbumPageSkeleton } from "./album-skeleton";

import { formatDate } from "@/utils/format";
import { createClient } from "@/utils/supabase/client";
import { usePlayer, Track } from "@/hooks/use-player";

interface AlbumContainerProps {
  albumId: string;
}

const AlbumContainer = ({ albumId }: AlbumContainerProps) => {
  const supabase = createClient();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  // 1. Fetch thông tin chi tiết Album
  const { data: album, isLoading: isLoadingAlbum } = useQuery({
    queryKey: ["album-detail", albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  // 2. Fetch danh sách bài hát thuộc Album này
  const { data: tracks = [], isLoading: isLoadingTracks } = useQuery({
    queryKey: ["album-tracks", albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("album_id", albumId)
        .order("track_number", { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // 3. Fetch các album khác của cùng nghệ sĩ
  const { data: otherAlbums = [] } = useQuery({
    queryKey: ["other-albums", album?.artist_name, albumId],
    enabled: !!album?.artist_name,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("artist_name", album.artist_name)
        .neq("id", albumId)
        .limit(6);
      if (error) return [];
      return data || [];
    },
  });

  const isLoadingAlbumDetail = isLoadingAlbum || isLoadingTracks;

  if (isLoadingAlbumDetail) {
    return <AlbumPageSkeleton />;
  }

  // Tính tổng thời lượng album (đơn vị: phút)
  const totalDurationMs = tracks.reduce(
    (acc: number, track: any) => acc + (track.duration_ms || 180000),
    0,
  );
  const totalMins = Math.round(totalDurationMs / 60000);

  // Kiểm tra xem album này có đang phát hay không
  const isThisAlbumPlaying =
    isPlaying && tracks.some((t: any) => t.id === currentTrack?.id);

  // Xử lý nút Play toàn bộ Album
  const handlePlayAlbum = () => {
    if (tracks.length === 0) {
      toast.error("Album này chưa có bài hát nào!");
      return;
    }

    if (isThisAlbumPlaying) {
      togglePlay();
      return;
    }

    // Format sang kiểu Track của Player store
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

    playTrack(formattedTracks[0], formattedTracks);
  };

  const releaseYear = album?.release_date
    ? formatDate(album.release_date, "yearOnly")
    : "2026";
  const artistName = album?.artist_name || "Artisans";

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* --- HERO SECTION --- */}
      {album && <AlbumHeroSection album={album} totalMins={totalMins} />}

      {/* --- CONTENT SECTION --- */}
      <div className="px-6 bg-gradient-to-b from-secondary/50 to-background min-h-screen pt-4">
        <div className="pb-8">
          {/* --- ACTION BAR --- */}
          <div className="flex items-center gap-6 py-6">
            <button
              onClick={handlePlayAlbum}
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-primary/25 cursor-pointer text-white"
            >
              {isThisAlbumPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-1" />
              )}
            </button>
          </div>

          {album && <AlbumTrackList album={album} tracks={tracks} />}
        </div>

        {/* Copyright Information */}
        <div className="mt-8 mb-12 flex flex-col gap-1 text-[13px] text-muted-foreground font-medium">
          <p>{formatDate(album?.release_date || "", "full")}</p>
          <p>
            © {releaseYear} {artistName}
          </p>
          {album?.record_label && (
            <p>
              ℗ {releaseYear} {album.record_label}
            </p>
          )}
        </div>

        {/* Other Albums */}
        {otherAlbums.length > 0 && (
          <div className="mt-12 pb-32">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Nhiều hơn từ {artistName}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {otherAlbums.map((otherAlbum: any) => (
                <AlbumCard key={otherAlbum.id} album={otherAlbum} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumContainer;
