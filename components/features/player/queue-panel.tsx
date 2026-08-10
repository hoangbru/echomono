"use client";

import Image from "next/image";
import { Play, X } from "lucide-react";

import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/utils/helpers";

export function QueuePanel() {
  const {
    queue,
    currentIndex,
    isQueueVisible,
    currentTrack,
    isPlaying,
    playTrack,
    toggleQueue,
  } = usePlayer();

  if (!isQueueVisible || queue.length === 0) return null;

  // Cắt mảng lấy các bài hát nằm sau bài hiện tại
  const nextTracks = queue.slice(currentIndex + 1);

  return (
    <div
      className={cn(
        "fixed top-0 right-0 bottom-0 md:bottom-24 w-full md:w-[350px] bg-sidebar border-l border-border z-[120] overflow-y-auto p-4 shadow-2xl transition-transform duration-300 ease-in-out",
        isQueueVisible ? "translate-x-0" : "translate-x-full",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <h2 className="text-foreground font-bold text-[20px]">Danh sách chờ</h2>
        <button
          onClick={toggleQueue}
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors group"
          aria-label="Đóng danh sách chờ"
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Đang phát */}
      <div className="mb-8">
        <h3 className="text-[14px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">
          Đang phát
        </h3>

        {currentTrack && (
          <div className="flex items-center gap-3 p-2 rounded-md bg-accent cursor-pointer relative group">
            <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 shadow-md">
              <Image
                src={currentTrack.imageUrl || "/default-cover.jpg"}
                alt={currentTrack.title}
                fill
                sizes="48px"
                className="object-cover"
              />

              {isPlaying && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <div className="flex items-end gap-[2px] h-4">
                    <div className="w-1 bg-primary rounded-full h-3 animate-now-playing-bar-1" />
                    <div className="w-1 bg-primary rounded-full h-2 animate-now-playing-bar-2" />
                    <div className="w-1 bg-primary rounded-full h-4 animate-now-playing-bar-3" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-primary text-[14px] font-bold truncate">
                {currentTrack.title}
              </span>
              <span className="text-muted-foreground text-[12px] truncate">
                {currentTrack.artistNames}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tiếp theo */}
      {nextTracks.length > 0 && (
        <div>
          <h3 className="text-[14px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Tiếp theo
          </h3>
          <div className="flex flex-col gap-1">
            {nextTracks.map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer group transition-colors"
                onClick={() => playTrack(track)}
              >
                <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 shadow-sm">
                  <Image
                    src={track.imageUrl || "/default-cover.jpg"}
                    alt={track.title}
                    fill
                    sizes="48px"
                    className="object-cover group-hover:opacity-30 transition"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Play className="w-5 h-5 text-foreground fill-foreground" />
                  </div>
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-foreground text-[14px] font-medium truncate group-hover:text-primary transition-colors">
                    {track.title}
                  </span>
                  <span className="text-muted-foreground text-[12px] truncate">
                    {track.artistNames}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
