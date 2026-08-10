"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Track } from "@/types";
import { usePlayer } from "@/hooks/use-player";

interface PlayAllButtonProps {
  tracks: Track[];
}

export function PlayAllButton({ tracks }: PlayAllButtonProps) {
  const { playTrack } = usePlayer();

  const handlePlayAll = () => {
    // if (tracks && tracks.length > 0) {
    //   playTrack(tracks[0], tracks);
    // }
  };

  return (
    <Button
      onClick={handlePlayAll}
      size="lg"
      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-8 shadow-[0_0_20px_rgba(255,26,140,0.4)] transition-all hover:scale-105"
    >
      <Play className="w-5 h-5 mr-2 fill-current text-primary-foreground" />
      Hôm nay nghe gì
    </Button>
  );
}
