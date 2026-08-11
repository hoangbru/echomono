"use client";

import { ListMusic } from "lucide-react";

import { TrackInfo } from "./track-info";
import { ShuffleButton } from "./shuffle-button";
import { PrevButton } from "./prev-button";
import { PlayPauseButton } from "./play-pause-button";
import { NextButton } from "./next-button";
import { RepeatButton } from "./repeat-button";
import { ProgressBar } from "./progress-bar";
import { LyricsPlayer } from "./lyrics-player";
import { VolumeControl } from "./volume-control";

import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/utils/helpers";

interface DesktopPlayerProps {
  currentTime: number;
  duration: number;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSeekToTime: (time: number) => void;
}

export function DesktopPlayer({
  currentTime,
  duration,
  isExpanded,
  setIsExpanded,
  handleSeek,
  handleSeekToTime,
}: DesktopPlayerProps) {
  const toggleQueue = usePlayer((state) => state.toggleQueue);
  const mobileProgressPercent =
    duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 h-16 md:h-24 bg-background border-t border-border px-2 md:px-4 flex items-center justify-between z-[110]",
        isExpanded && "hidden md:flex",
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] md:hidden bg-muted">
        <div
          className="h-full bg-primary transition-all duration-150 ease-linear"
          style={{ width: `${mobileProgressPercent}%` }}
        />
      </div>

      <div
        className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 cursor-pointer md:cursor-default"
        onClick={() => {
          if (window.innerWidth < 768) setIsExpanded(true);
        }}
      >
        <TrackInfo />
      </div>

      <div className="flex md:hidden items-center gap-2 shrink-0 pr-1">
        <PlayPauseButton />
        <NextButton />
      </div>

      <div className="hidden md:flex flex-col items-center max-w-[40%] w-full gap-2">
        <div className="flex items-center gap-6">
          <ShuffleButton />
          <PrevButton />
          <PlayPauseButton />
          <NextButton />
          <RepeatButton />
        </div>
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />
      </div>

      <div className="hidden md:flex items-center justify-end gap-4 w-[30%] min-w-[150px]">
        <LyricsPlayer
          currentTime={currentTime}
          onSeekToTime={handleSeekToTime}
        />
        <button
          onClick={toggleQueue}
          className="text-muted-foreground hover:text-foreground transition-colors p-2"
        >
          <ListMusic className="w-5 h-5" />
        </button>
        <VolumeControl />
      </div>
    </div>
  );
}
