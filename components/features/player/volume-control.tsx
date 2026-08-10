import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlayer } from "@/hooks/use-player";
import { Volume2, VolumeX } from "lucide-react";

interface VolumeControlProps {}

export function VolumeControl({}: VolumeControlProps) {
  const { volume, setVolume } = usePlayer();
  const volumePercent = volume * 100;

  return (
    <div className="flex items-center gap-2 group">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-popover text-popover-foreground border-border rounded-md text-xs font-semibold px-3 py-1.5 mb-2"
        >
          <p>{volume === 0 ? "Bật âm" : "Tắt âm"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Range Volume */}
      <div className="relative w-20 h-1 flex items-center">
        <div className="absolute left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground group-hover:bg-primary transition-colors"
            style={{ width: `${volumePercent}%` }}
          />
        </div>
        <div
          className="absolute w-3 h-3 bg-foreground rounded-full opacity-0 group-hover:opacity-100 shadow-md pointer-events-none z-10 transition-opacity"
          style={{
            left: `${volumePercent}%`,
            transform: "translateX(-50%)",
          }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 appearance-none"
        />
      </div>
    </div>
  );
}
