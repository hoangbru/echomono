import { Repeat, Repeat1 } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/utils/helpers";

export function RepeatButton() {
  const { currentTrack, repeatMode, toggleRepeat } = usePlayer();

  if (!currentTrack) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleRepeat}
          className={cn(
            "transition-colors",
            repeatMode !== "off"
              ? "text-primary relative after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {repeatMode === "one" ? (
            <Repeat1 className="w-4 h-4" />
          ) : (
            <Repeat className="w-4 h-4" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-popover text-popover-foreground border-border rounded-md text-xs font-semibold px-3 py-1.5 mb-2"
      >
        <p>
          {repeatMode === "off"
            ? "Bật lặp lại"
            : repeatMode === "all"
              ? "Bật lặp lại một bài"
              : "Tắt lặp lại"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
