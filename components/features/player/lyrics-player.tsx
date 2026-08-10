"use client";

import { useMemo, useEffect, useRef, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { parseLRC } from "@/utils/lyrics";
import { cn } from "@/utils/helpers";
import { Mic2 } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";

interface LyricsPlayerProps {
  currentTime: number;
  onSeekToTime: (time: number) => void;
}

export function LyricsPlayer({ currentTime, onSeekToTime }: LyricsPlayerProps) {
  const currentTrack = usePlayer((state) => state.currentTrack);
  const isQueueVisible = usePlayer((state) => state.isQueueVisible);

  const [isOpen, setIsOpen] = useState(false);

  const rawLyrics = currentTrack?.lyrics?.trim() || "";

  // 1. Parse LRC
  const lrcData = useMemo(() => parseLRC(rawLyrics), [rawLyrics]);

  // 2. Kiểm tra xem có phải định dạng LRC hợp lệ không (có mảng và có thời gian)
  const isLRC = useMemo(() => {
    return lrcData.length > 0 && lrcData.some((line) => line.time > 0);
  }, [lrcData]);

  // 3. Tách chuỗi cho Plain Text (nếu không phải LRC)
  const plainTextLines = useMemo(() => {
    if (isLRC || !rawLyrics) return [];
    return rawLyrics
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [rawLyrics, isLRC]);

  const activeLineRef = useRef<HTMLDivElement>(null);

  // Tính vị trí dòng Karaoke đang phát
  const activeIndex = useMemo(() => {
    if (!isLRC) return -1;
    return lrcData.findIndex((line, index) => {
      const nextLine = lrcData[index + 1];
      return (
        currentTime >= line.time && (!nextLine || currentTime < nextLine.time)
      );
    });
  }, [currentTime, lrcData, isLRC]);

  // Cuộn mượt đến dòng active khi hát karaoke
  useEffect(() => {
    if (isLRC && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, isLRC]);

  if (!currentTrack) return null;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              "transition-colors p-2 cursor-pointer",
              isOpen
                ? "text-primary relative after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Mic2 className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-popover text-popover-foreground border-border rounded-md text-xs font-semibold px-3 py-1.5 mb-2"
        >
          <p>Lời bài hát</p>
        </TooltipContent>
      </Tooltip>

      <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <SheetContent
          side="bottom"
          onInteractOutside={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
          className={cn(
            "h-[85vh] bg-background border-border border-t rounded-t-[2rem] z-[100] pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all duration-300",
            isQueueVisible && "mr-[350px]",
          )}
        >
          <SheetHeader className="max-w-2xl mx-auto w-full">
            <div className="flex flex-col items-center gap-1 mb-4">
              <div className="w-12 h-1.5 bg-muted rounded-full mb-3" />
              <SheetTitle className="text-foreground text-center text-xl font-bold tracking-tight">
                {currentTrack.title || "Đang phát"}
              </SheetTitle>
              <p className="text-primary text-xs font-bold tracking-wide uppercase">
                {currentTrack.artistNames || "Nghệ sĩ"}
              </p>
            </div>
          </SheetHeader>

          <div className="max-w-3xl mx-auto h-[calc(85vh-160px)] overflow-hidden">
            <div className="h-full overflow-y-auto custom-scrollbar px-6 py-4 space-y-6">
              {/* TRƯỜNG HỢP 1: LỜI BÀI HÁT KARAOKE (LRC) */}
              {isLRC ? (
                lrcData.map((line, index) => {
                  const isActive = index === activeIndex;
                  const isPassed = index < activeIndex;

                  return (
                    <div
                      key={index}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => onSeekToTime(line.time)}
                      className={cn(
                        "text-2xl sm:text-3xl font-bold transition-all duration-500 transform origin-left cursor-pointer select-none",
                        isActive
                          ? "text-primary scale-105"
                          : isPassed
                            ? "text-foreground opacity-60 hover:text-primary hover:opacity-100"
                            : "text-muted-foreground opacity-40 hover:text-primary hover:opacity-80",
                      )}
                    >
                      {line.text || "•••"}
                    </div>
                  );
                })
              ) : /* TRƯỜNG HỢP 2: LỜI BÀI HÁT VĂN BẢN THƯỜNG (PLAIN TEXT) */
              plainTextLines.length > 0 ? (
                <div className="space-y-4 py-6 text-center sm:text-left">
                  {plainTextLines.map((line, index) => (
                    <p
                      key={index}
                      className="text-lg sm:text-xl font-semibold text-foreground/80 leading-relaxed hover:text-foreground transition-colors"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                /* TRƯỜNG HỢP 3: CHƯA CÓ LỜI BÀI HÁT */
                <div className="h-full flex items-center justify-center text-muted-foreground italic text-center p-8">
                  (Bài hát này chưa có lời bài hát)
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
