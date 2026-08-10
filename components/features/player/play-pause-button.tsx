import { Pause, Play } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { usePlayer } from "@/hooks/use-player";

export function PlayPauseButton() {
  const { isPlaying, togglePlay, currentTrack } = usePlayer();

  if (!currentTrack) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={togglePlay}
          className="w-8 h-8 flex items-center justify-center bg-foreground rounded-full text-background hover:scale-105 transition-transform shadow-md"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-1" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-popover text-popover-foreground border-border rounded-md text-xs font-semibold px-3 py-1.5 mb-2"
      >
        <p>{isPlaying ? "Tạm dừng" : "Phát"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
