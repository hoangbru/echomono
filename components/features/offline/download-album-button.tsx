"use client";

import { useState, useEffect } from "react";
import { Download, Check, Loader2, AlertCircle } from "lucide-react";
import { get } from "idb-keyval";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Track } from "@/hooks/use-player";
import { downloadAudioForOffline } from "@/utils/offline";

interface DownloadAlbumButtonProps {
  tracks: Track[];
  albumName: string;
}

export function DownloadAlbumButton({
  tracks,
  albumName,
}: DownloadAlbumButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "downloaded" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [tracksToDownload, setTracksToDownload] = useState(0);

  // Kiểm tra xem toàn bộ album đã được tải chưa khi vừa render
  useEffect(() => {
    const checkStatus = async () => {
      if (!tracks || tracks.length === 0) return;

      const offlineTracks: Track[] = (await get("offline_tracks")) || [];
      const offlineIds = new Set(offlineTracks.map((t) => t.id));

      const isAllDownloaded = tracks.every((t) => offlineIds.has(t.id));
      if (isAllDownloaded) {
        setStatus("downloaded");
      }
    };
    checkStatus();
  }, [tracks]);

  const handleDownloadAlbum = async () => {
    if (status === "downloaded") {
      toast.info("Album này đã có sẵn trong máy!");
      return;
    }

    if (tracks.length === 0) {
      toast.error("Album chưa có bài hát nào!");
      return;
    }

    try {
      // 1. Lọc ra những bài hát CHƯA tải
      const offlineTracks: Track[] = (await get("offline_tracks")) || [];
      const offlineIds = new Set(offlineTracks.map((t) => t.id));
      const missingTracks = tracks.filter((t) => !offlineIds.has(t.id));

      if (missingTracks.length === 0) {
        setStatus("downloaded");
        return;
      }

      // 2. Bắt đầu tải
      setStatus("loading");
      setTracksToDownload(missingTracks.length);
      setProgress(0);

      // TẢI TUẦN TỰ (Sequential) để tránh nghẽn mạng & sập trình duyệt
      for (let i = 0; i < missingTracks.length; i++) {
        const track = missingTracks[i];
        const success = await downloadAudioForOffline(track);

        if (!success) {
          console.warn(`Lỗi khi tải bài: ${track.title}`);
          // Vẫn tiếp tục tải các bài khác dù có 1 bài lỗi
        }

        // Cập nhật tiến độ
        setProgress(i + 1);
      }

      setStatus("downloaded");
      toast.success(`Đã tải trọn bộ album ${albumName}`);
    } catch (error) {
      console.error(error);
      setStatus("error");
      toast.error("Có lỗi xảy ra khi tải album. Vui lòng thử lại.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <Button
      onClick={handleDownloadAlbum}
      disabled={status === "loading" || tracks.length === 0}
      variant={status === "downloaded" ? "secondary" : "default"}
      className="gap-2 rounded-full font-bold px-6 h-12 shadow-lg transition-all"
    >
      {status === "idle" && (
        <>
          <Download className="w-5 h-5" /> Tải Album
        </>
      )}

      {status === "loading" && (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang tải {progress}/{tracksToDownload}
        </>
      )}

      {status === "downloaded" && (
        <>
          <Check className="w-5 h-5 text-green-500" /> Đã tải xuống
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="w-5 h-5 text-red-500" /> Thử lại
        </>
      )}
    </Button>
  );
}
