import { ChangeEvent } from "react";

import { formatTime } from "@/utils/format";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: ProgressBarProps) {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 w-full text-xs text-muted-foreground font-medium group">
      <span className="w-10 text-right">{formatTime(currentTime)}</span>
      <div className="relative flex-1 h-1 flex items-center">
        <div className="absolute left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground group-hover:bg-primary transition-colors"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div
          className="absolute w-3 h-3 bg-foreground rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-opacity z-10 pointer-events-none"
          style={{
            left: `${progressPercent}%`,
            transform: "translateX(-50%)",
          }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={onSeek}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
        />
      </div>
      <span className="w-10 text-left">{formatTime(duration)}</span>
    </div>
  );
}
