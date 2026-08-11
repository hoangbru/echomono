"use client";

import { useEffect, useRef, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

import { MobilePlayer } from "./mobile-player";
import { DesktopPlayer } from "./desktop-player";
import { usePlayer, Track } from "@/hooks/use-player";
import { createClient } from "@/utils/supabase/client";

export function GlobalPlayer() {
  const supabase = createClient();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Ref để ngăn chặn gọi API Autoplay nhiều lần liên tiếp
  const isFetchingAutoplay = useRef(false);

  const {
    currentTrack,
    isPlaying,
    volume,
    repeatMode,
    playNext,
    setPlayState,
    queue,
    currentIndex,
    addTracksToQueue, // Cần chắc chắn hàm này đã được định nghĩa trong zustand store
  } = usePlayer();

  // ==========================================
  // THUẬT TOÁN TỰ ĐỘNG GỢI Ý (TỐI ƯU TUYỆT ĐỐI BẰNG RPC)
  // ==========================================
  useEffect(() => {
    const fetchAutoplayTracks = async () => {
      if (
        queue.length > 0 &&
        currentIndex === queue.length - 1 &&
        !isFetchingAutoplay.current
      ) {
        isFetchingAutoplay.current = true;

        try {
          // Chỉ gom ID của các bài hiện tại để gửi lên DB
          const currentIds = queue.map((t) => t.id);

          // GỌI HÀM DATABASE: Truyền mảng ID cần loại trừ và xin đúng 30 bài
          const { data, error } = await supabase.rpc("get_random_tracks", {
            exclude_ids: currentIds,
            limit_count: 20,
          });

          if (error) throw error;

          if (data && data.length > 0) {
            // Dữ liệu trả về đã được xào ngẫu nhiên sẵn từ Database, chỉ việc format lại
            const newTracks: Track[] = data.map((t: any) => ({
              id: t.id,
              title: t.title,
              artistNames: t.artist_name || t.album_artist || "Unknown",
              imageUrl: t.album_cover || "/default-cover.jpg", // Lấy thẳng ảnh của Album
              audioUrl: supabase.storage
                .from("songs_bucket")
                .getPublicUrl(t.audio_path).data.publicUrl,
              albumId: t.album_id,
              lyrics: t.lyrics,
              albumTitle: t.album_title,
            }));

            addTracksToQueue(newTracks);
          }
        } catch (err) {
          console.error("Lỗi Autoplay RPC:", err);
        } finally {
          isFetchingAutoplay.current = false;
        }
      }
    };

    fetchAutoplayTracks();
  }, [currentIndex, queue.length]);

  // Đồng bộ Play/Pause
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.log("Lỗi autoplay:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // Đồng bộ Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleEnded = () => {
    if (repeatMode === "one" && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      playNext();
    }
  };

  const handleSeekToTime = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSeekToTime(Number(e.target.value));
  };

  if (!currentTrack) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleEnded}
        onPlay={() => setPlayState(true)}
        onPause={() => setPlayState(false)}
      />

      <MobilePlayer
        currentTrack={currentTrack}
        currentTime={currentTime}
        duration={duration}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        handleSeek={handleSeek}
        handleSeekToTime={handleSeekToTime}
      />

      <DesktopPlayer
        currentTime={currentTime}
        duration={duration}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        handleSeek={handleSeek}
        handleSeekToTime={handleSeekToTime}
      />
    </TooltipProvider>
  );
}
