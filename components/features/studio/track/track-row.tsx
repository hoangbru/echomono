"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit2, Globe, Lock, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TrackDetail } from "@/types";

interface TrackRowProps {
  track: TrackDetail; // Dữ liệu trực tiếp từ Supabase Database
  albumId: string;
  onDelete: (track: TrackDetail) => void;
}

export function TrackRow({ track, albumId, onDelete }: TrackRowProps) {
  const router = useRouter();

  // Hàm chuyển đổi duration (ms) sang format mm:ss
  const formatDuration = (ms: number) => {
    if (!ms) return "--:--";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <tr className="group border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-3 px-4 w-12 text-center text-gray-500 font-bold text-sm">
        {track.track_number}
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <p className="text-white font-medium truncate">{track.title}</p>
          </div>
        </div>
      </td>

      <td className="py-4 px-4 text-sm text-gray-400">
        <span className="text-sm text-muted-foreground truncate">
          {track.artist_name || "Unknown"}
        </span>
      </td>

      <td className="py-4 px-4 text-sm text-gray-400">
        {formatDuration(track.duration_ms)}
      </td>

      <td className="py-4 px-4 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              // Sửa đường dẫn để khớp với thư mục thực tế
              router.push(`/studio/${albumId}/tracks/edit/${track.id}`)
            }
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Edit2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(track)}
            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
