import { SkipForward } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { usePlayer } from "@/hooks/use-player";

export function NextButton() {
  const { playNext, currentTrack } = usePlayer();

  if (!currentTrack) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={playNext}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-popover text-popover-foreground border-border rounded-md text-xs font-semibold px-3 py-1.5 mb-2"
      >
        <p>Tiếp theo</p>
      </TooltipContent>
    </Tooltip>
  );
}
