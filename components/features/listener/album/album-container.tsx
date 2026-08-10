// components/features/listener/album/album-container.tsx
"use client";

import { Pause, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { AlbumTrackList } from "./album-track-list";
import { AlbumHeroSection } from "./album-hero-section";
import { AlbumCard } from "@/components/shared/cards";
import { AlbumPageSkeleton } from "./album-skeleton";
import { DownloadAlbumButton } from "@/components/features/offline/download-album-button"; // MỚI THÊM

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

  // 2. Fetch danh sách bài hát
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

  // 3. Fetch album khác
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

  if (isLoadingAlbum || isLoadingTracks) {
    return <AlbumPageSkeleton />;
  }

  const totalDurationMs = tracks.reduce(
    (acc: number, track: any) => acc + (track.duration_ms || 180000),
    0,
  );
  const totalMins = Math.round(totalDurationMs / 60000);
  const isThisAlbumPlaying =
    isPlaying && tracks.some((t: any) => t.id === currentTrack?.id);

  // Chuẩn bị danh sách Track chuẩn (dùng chung cho cả Player và Download)
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
    albumTitle: album.title,
  }));

  const handlePlayAlbum = () => {
    if (formattedTracks.length === 0) {
      toast.error("Album này chưa có bài hát nào!");
      return;
    }
    if (isThisAlbumPlaying) {
      togglePlay();
      return;
    }
    playTrack(formattedTracks[0], formattedTracks);
  };

  const releaseYear = album?.release_date
    ? formatDate(album.release_date, "yearOnly")
    : "2026";
  const artistName = album?.artist_name || "Artisans";

  return (
    <div className="bg-background text-foreground min-h-screen pb-32">
      {/* HERO SECTION */}
      {album && <AlbumHeroSection album={album} totalMins={totalMins} />}

      {/* CONTENT SECTION */}
      <div className="px-4 sm:px-6 bg-gradient-to-b from-secondary/50 to-background pt-4">
        {/* --- ACTION BAR (Tích hợp nút Tải) --- */}
        <div className="flex items-center gap-4 sm:gap-6 py-6 sticky top-0 bg-background/50 backdrop-blur-md z-20 rounded-xl">
          {/* Nút Play to */}
          <button
            onClick={handlePlayAlbum}
            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-primary/25 cursor-pointer text-white"
          >
            {isThisAlbumPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-1" />
            )}
          </button>

          {/* Nút Tải Album */}
          {album && formattedTracks.length > 0 && (
            <DownloadAlbumButton
              tracks={formattedTracks}
              albumName={album.title}
            />
          )}
        </div>

        {/* TRACK LIST */}
        {album && <AlbumTrackList album={album} tracks={tracks} />}

        {/* COPYRIGHT INFO */}
        <div className="mt-8 mb-12 flex flex-col gap-1 text-[13px] text-muted-foreground font-medium px-4">
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

        {/* OTHER ALBUMS */}
        {otherAlbums.length > 0 && (
          <div className="mt-12 px-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Nhiều hơn từ {artistName}
            </h2>
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
