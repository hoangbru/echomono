"use client";

import Image from "next/image";
import { Music, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/helpers";

interface AlbumFormMediaProps {
  searchResults: any[];
  selectedAlbum: any | null;
  onSelectAlbum: (album: any) => void;
  isSearching: boolean;
}

export function AlbumFormMedia({
  searchResults,
  selectedAlbum,
  onSelectAlbum,
  isSearching,
}: AlbumFormMediaProps) {
  return (
    <div className="col-span-1">
      <div className="bg-card p-6 rounded-2xl border border-white/10 h-full flex flex-col">
        <label className="text-sm font-bold text-gray-300 block mb-4">
          Chọn phiên bản Album từ Apple *
        </label>

        {isSearching ? (
          <div className="aspect-square rounded-xl border border-white/10 bg-background flex items-center justify-center text-gray-400 text-sm animate-pulse">
            Đang tìm kiếm trên iTunes...
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
            <p className="text-xs text-muted-foreground mb-2">
              Tìm thấy {searchResults.length} kết quả. Bấm vào ảnh bìa bạn muốn:
            </p>
            {searchResults.map((item) => {
              const isSelected = selectedAlbum?.itunes_id === item.itunes_id;
              return (
                <div
                  key={item.itunes_id}
                  onClick={() => onSelectAlbum(item)}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all relative group",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                      : "border-white/5 bg-background hover:border-white/20",
                  )}
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <Image
                      src={item.cover_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white text-xs font-bold truncate">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 text-[11px] truncate mt-0.5">
                      {item.artist_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {item.total_tracks} bài • {item.release_date}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="aspect-square rounded-xl border-2 border-dashed border-white/10 bg-background flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
              <Music className="w-6 h-6" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Nhập tên Album ở ô bên cạnh và bấm <b>"Tìm kiếm trên iTunes"</b>{" "}
              để hiển thị các lựa chọn ảnh bìa.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
