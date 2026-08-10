"use client";

import { useState, useEffect } from "react";
import { Download, Check, Loader2, AlertCircle } from "lucide-react";
import { get, set } from "idb-keyval";
import { toast } from "sonner";

import { cn } from "@/utils/helpers";
import { Track } from "@/hooks/use-player";

interface DownloadButtonProps {
  track: Track;
  className?: string; // Để dễ dàng tuỳ chỉnh margin/padding từ component cha
}

export function DownloadButton({ track, className }: DownloadButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "downloaded" | "error"
  >("idle");

  // Kiểm tra xem bài hát này đã nằm trong thư viện offline chưa khi component render
  useEffect(() => {
    const checkOfflineStatus = async () => {
      try {
        const offlineTracks: Track[] = (await get("offline_tracks")) || [];
        if (offlineTracks.some((t) => t.id === track.id)) {
          setStatus("downloaded");
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái offline:", error);
      }
    };
    checkOfflineStatus();
  }, [track.id]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài (tránh việc click nút tải mà lại play nhạc)
    e.preventDefault();

    if (status === "downloaded") {
      toast.info("Bài hát này đã có sẵn trong máy của bạn.");
      return;
    }

    setStatus("loading");

    try {
      // 1. Mở không gian lưu trữ riêng cho ứng dụng
      const cache = await caches.open("musichub-offline-audio-v1");

      // 2. Fetch đồng thời cả file âm thanh và ảnh bìa
      const [audioResponse, coverResponse] = await Promise.all([
        fetch(track.audioUrl),
        fetch(track.imageUrl),
      ]);

      if (!audioResponse.ok) throw new Error("Lỗi tải file âm thanh");

      // 3. Đưa file vào bộ nhớ đệm (Cache Storage)
      await cache.put(track.audioUrl, audioResponse);
      if (coverResponse.ok) {
        await cache.put(track.imageUrl, coverResponse);
      }

      // 4. Lưu metadata vào IndexedDB để dựng UI trang Thư viện Offline
      const offlineTracks: Track[] = (await get("offline_tracks")) || [];
      if (!offlineTracks.some((t) => t.id === track.id)) {
        offlineTracks.push(track);
        await set("offline_tracks", offlineTracks);
      }

      setStatus("downloaded");
      toast.success(`Đã tải xong: ${track.title}`);
    } catch (error: any) {
      console.error("Lỗi khi tải bài hát:", error);
      setStatus("error");
      toast.error("Không thể tải bài hát. Vui lòng kiểm tra lại mạng.");

      // Đưa nút quay về trạng thái ban đầu sau 3 giây để người dùng có thể thử lại
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={status === "loading"}
      className={cn(
        "p-2 rounded-full transition-all duration-300 flex items-center justify-center outline-none",
        status === "downloaded"
          ? "text-primary bg-primary/10 hover:bg-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
        status === "loading" && "opacity-70 cursor-not-allowed",
        className,
      )}
      title={
        status === "downloaded" ? "Đã tải xuống" : "Tải xuống để nghe offline"
      }
    >
      {status === "idle" && <Download className="w-4 h-4" />}
      {status === "loading" && (
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      )}
      {status === "downloaded" && <Check className="w-4 h-4" />}
      {status === "error" && (
        <AlertCircle className="w-4 h-4 text-destructive" />
      )}
    </button>
  );
}
