// app/library/downloads/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  ArrowDownCircle,
  Play,
  Trash2,
  WifiOff,
  Disc3,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

import {
  getOfflineTracks,
  removeOfflineTrack,
  removeOfflineAlbum,
} from "@/utils/offline";
import { usePlayer, Track } from "@/hooks/use-player";
import { cn } from "@/utils/helpers";

export default function DownloadsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Trạng thái quản lý góc nhìn (Tabs)
  const [viewMode, setViewMode] = useState<"tracks" | "albums">("albums");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  useEffect(() => {
    loadOfflineTracks();
  }, []);

  const loadOfflineTracks = async () => {
    try {
      const data = await getOfflineTracks();
      setTracks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động nhóm bài hát thành các Album
  const downloadedAlbums = useMemo(() => {
    const albumsMap = new Map<
      string,
      {
        id: string;
        title: string;
        artist: string;
        imageUrl: string;
        trackCount: number;
      }
    >();

    tracks.forEach((track) => {
      if (!albumsMap.has(track.albumId)) {
        albumsMap.set(track.albumId, {
          id: track.albumId,
          title: track.albumTitle || "Album không xác định",
          artist: track.artistNames,
          imageUrl: track.imageUrl,
          trackCount: 0,
        });
      }
      albumsMap.get(track.albumId)!.trackCount += 1;
    });

    return Array.from(albumsMap.values());
  }, [tracks]);

  // Lọc bài hát theo góc nhìn hiện tại
  const displayedTracks = useMemo(() => {
    if (selectedAlbumId) {
      return tracks.filter((t) => t.albumId === selectedAlbumId);
    }
    return tracks;
  }, [tracks, selectedAlbumId]);

  const handlePlayTrack = (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }
    playTrack(track, displayedTracks);
  };

  const handleDeleteTrack = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const success = await removeOfflineTrack(track);
    if (success) {
      setTracks((prev) => prev.filter((t) => t.id !== track.id));
      toast.success("Đã xóa bài hát khỏi thiết bị.");
    }
  };

  const handleDeleteAlbum = async (e: React.MouseEvent, albumId: string) => {
    e.stopPropagation();
    const success = await removeOfflineAlbum(albumId);
    if (success) {
      setTracks((prev) => prev.filter((t) => t.albumId !== albumId));
      if (selectedAlbumId === albumId) setSelectedAlbumId(null);
      toast.success("Đã xóa toàn bộ Album khỏi thiết bị.");
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Đang tải thư viện...
      </div>
    );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-32">
      {/* HEADER HERO */}
      <div className="flex items-end gap-6 mb-8 mt-4">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gradient-to-br from-green-500 to-green-900 flex items-center justify-center shadow-2xl shrink-0">
          <ArrowDownCircle className="w-16 h-16 md:w-20 md:h-20 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <WifiOff className="w-4 h-4" /> Ngoại tuyến
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Nhạc Đã Tải
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            {tracks.length} bài hát • {downloadedAlbums.length} Album
          </p>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-20 bg-card/30 rounded-2xl border border-border mt-8">
          <ArrowDownCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold">Thư viện trống</h3>
          <p className="text-muted-foreground text-sm mt-2">
            Tìm và tải xuống các bài hát hoặc album để nghe khi không có mạng.
          </p>
        </div>
      ) : (
        <>
          {/* TABS (BỘ LỌC) */}
          <div className="flex items-center gap-3 mb-6">
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

          {/* GÓC NHÌN ALBUMS */}
          {viewMode === "albums" && !selectedAlbumId && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {downloadedAlbums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => setSelectedAlbumId(alb.id)}
                  className="group bg-card p-4 rounded-xl border border-border/10 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-md bg-muted">
                    <Image
                      src={alb.imageUrl}
                      alt={alb.title}
                      fill
                      className="object-cover"
                    />

                    {/* Nút Xóa Album (Hiện khi hover) */}
                    <button
                      onClick={(e) => handleDeleteAlbum(e, alb.id)}
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
          )}

          {/* GÓC NHÌN BÀI HÁT (List) */}
          {(viewMode === "tracks" || selectedAlbumId) && (
            <div className="flex flex-col gap-1">
              {displayedTracks.map((track, index) => {
                const isCurrentTrack = currentTrack?.id === track.id;

                return (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track, index)}
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
                          <span className="group-hover:hidden">
                            {index + 1}
                          </span>
                        )}
                        <Play
                          className={cn(
                            "w-4 h-4 hidden",
                            !isCurrentTrack &&
                              "group-hover:block text-foreground",
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
                      onClick={(e) => handleDeleteTrack(e, track)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
                      title="Xóa bài hát"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
