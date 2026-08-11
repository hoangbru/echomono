"use client";

import { ChevronDown, ListMusic } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ShuffleButton } from "./shuffle-button";
import { PrevButton } from "./prev-button";
import { PlayPauseButton } from "./play-pause-button";
import { NextButton } from "./next-button";
import { RepeatButton } from "./repeat-button";
import { ProgressBar } from "./progress-bar";
import { LyricsPlayer } from "./lyrics-player";

import { Track, usePlayer } from "@/hooks/use-player";
import { cn } from "@/utils/helpers";

interface MobilePlayerProps {
  currentTrack: Track;
  currentTime: number;
  duration: number;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSeekToTime: (time: number) => void;
}

export function MobilePlayer({
  currentTrack,
  currentTime,
  duration,
  isExpanded,
  setIsExpanded,
  handleSeek,
  handleSeekToTime,
}: MobilePlayerProps) {
  const toggleQueue = usePlayer((state) => state.toggleQueue);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] bg-background flex flex-col p-6 transition-transform duration-500 ease-in-out md:hidden",
        isExpanded ? "translate-y-0" : "translate-y-full",
      )}
    >
      <button
        onClick={() => setIsExpanded(false)}
        className="absolute top-6 left-6 p-2 text-muted-foreground hover:text-foreground"
      >
        <ChevronDown className="w-8 h-8" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 mt-12">
        <div className="w-64 h-64 relative rounded-lg overflow-hidden shadow-2xl">
          <img
            src={currentTrack.imageUrl}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-foreground">
              {currentTrack.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {currentTrack.artistNames}
            </p>
          </div>
        </div>

        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />

        <div className="w-full flex items-center justify-between">
          <ShuffleButton />
          <PrevButton />
          <PlayPauseButton />
          <NextButton />
          <RepeatButton />
        </div>

        <div className="w-full flex items-center justify-between mt-4 px-4">
          <LyricsPlayer
            currentTime={currentTime}
            onSeekToTime={handleSeekToTime}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleQueue}
                className="text-muted-foreground p-2"
              >
                <ListMusic className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Danh sách chờ</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
