"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { get } from "idb-keyval";

import {
  getOfflineTracks,
  removeOfflineTrack,
  removeOfflineAlbum,
} from "@/utils/offline";
import { usePlayer, Track } from "@/hooks/use-player";

// Import các sub-components vừa tạo
import {
  OfflineHeader,
  OfflineEmptyState,
} from "@/components/features/offline/offline-header";
import { OfflineControls } from "@/components/features/offline/offline-controls";
import { OfflineAlbumGrid } from "@/components/features/offline/offline-album-grid";
import { OfflineTrackList } from "@/components/features/offline/offline-track-list";

export default function DownloadsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const displayedTracks = useMemo(() => {
    if (selectedAlbumId) {
      return tracks.filter((t) => t.albumId === selectedAlbumId);
    }
    return tracks;
  }, [tracks, selectedAlbumId]);

  const prepareOfflineQueue = async (tracksToPrepare: Track[]) => {
    return await Promise.all(
      tracksToPrepare.map(async (t) => {
        const audioBlob = await get(`audio_blob_${t.id}`);
        const coverBlob = await get(`cover_blob_${t.id}`);

        return {
          ...t,
          audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : t.audioUrl,
          imageUrl: coverBlob ? URL.createObjectURL(coverBlob) : t.imageUrl,
        };
      }),
    );
  };

  const handlePlayTrack = async (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }
    const toastId = toast.loading("Đang nạp dữ liệu nhạc ngoại tuyến...");
    try {
      const offlineQueue = await prepareOfflineQueue(displayedTracks);
      toast.dismiss(toastId);
      playTrack(offlineQueue[index], offlineQueue);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Có lỗi xảy ra khi phát nhạc.");
    }
  };

  const handlePlayAll = async () => {
    if (displayedTracks.length === 0) return;
    const toastId = toast.loading("Đang chuẩn bị danh sách phát...");
    try {
      const offlineQueue = await prepareOfflineQueue(displayedTracks);
      toast.dismiss(toastId);
      playTrack(offlineQueue[0], offlineQueue);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Có lỗi xảy ra khi nạp danh sách nhạc.");
    }
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
      <OfflineHeader
        trackCount={tracks.length}
        albumCount={downloadedAlbums.length}
      />

      {tracks.length === 0 ? (
        <OfflineEmptyState />
      ) : (
        <>
          <OfflineControls
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedAlbumId={selectedAlbumId}
            setSelectedAlbumId={setSelectedAlbumId}
            onPlayAll={handlePlayAll}
            hasTracksToPlay={displayedTracks.length > 0}
          />

          {viewMode === "albums" && !selectedAlbumId && (
            <OfflineAlbumGrid
              albums={downloadedAlbums}
              onSelectAlbum={setSelectedAlbumId}
              onDeleteAlbum={handleDeleteAlbum}
            />
          )}

          {(viewMode === "tracks" || selectedAlbumId) && (
            <OfflineTrackList
              tracks={displayedTracks}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onDeleteTrack={handleDeleteTrack}
            />
          )}
        </>
      )}
    </div>
  );
}
