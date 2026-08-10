"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Edit2, Trash2, Music, Globe, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AlbumDetail } from "@/types";

interface AlbumItemProps {
  album: AlbumDetail; // Dữ liệu từ Supabase Database
  onDelete: (album: AlbumDetail) => void;
}

export function AlbumItem({ album, onDelete }: AlbumItemProps) {
  const router = useRouter();

  return (
    <Link
      href={`/studio/${album.id}/tracks`}
      id={`album-${album.id}`} // 1. Khai báo ID hứng URL Hash
      // 2. Thêm scroll-mt-24 (tránh header che khuất) và target:* để tạo viền sáng
      className="block group scroll-mt-28 outline-none target:ring-2 target:ring-primary target:ring-offset-4 target:ring-offset-background rounded-2xl transition-all duration-700"
    >
      <div className="bg-card border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all h-full">
        <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg border border-white/10 bg-black/20">
          <Image
            src={album.cover_url || "/default-cover.jpg"}
            alt={album.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full h-10 w-10 hover:bg-white text-black"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/studio/edit/${album.id}`);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="rounded-full h-10 w-10 bg-red-500 hover:bg-red-600"
              onClick={(e) => {
                e.preventDefault();
                onDelete(album);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="text-white font-bold truncate">{album.title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Music className="w-3 h-3 text-primary" />
              <p className="text-xs text-gray-400">
                {album.total_tracks || 0} Bài hát
              </p>
            </div>
          </div>

          {album.is_published ? (
            <Globe className="w-4 h-4 text-green-500 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-yellow-500 shrink-0" />
          )}
        </div>
      </div>
    </Link>
  );
}
