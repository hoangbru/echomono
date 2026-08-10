import Image from "next/image";
import { Fragment } from "react";

import { usePlayer } from "@/hooks/use-player";

interface TrackInfoProps {}

export function TrackInfo({}: TrackInfoProps) {
  const { currentTrack } = usePlayer();

  if (!currentTrack) return null;
  return (
    <Fragment>
      <div className="relative w-14 h-14 rounded-md overflow-hidden shrink-0 border border-border">
        <Image
          src={currentTrack.imageUrl || "/default-cover.jpg"}
          alt={currentTrack.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col truncate">
        <h4 className="text-foreground text-sm font-bold truncate hover:underline cursor-pointer tracking-tight">
          {currentTrack.title}
        </h4>
        <span className="text-muted-foreground text-xs truncate hover:underline cursor-pointer mt-0.5 font-medium">
          {currentTrack.artistNames}
        </span>
      </div>
    </Fragment>
  );
}
