// components/features/album/album-hero-section.tsx
import Image from "next/image";
import { AlbumDetail } from "@/types";
import { formatDate } from "@/utils/format";

interface AlbumHeroSectionProps {
  album: AlbumDetail;
  totalMins: number;
}

export const AlbumHeroSection = ({
  album,
  totalMins,
}: AlbumHeroSectionProps) => {
  const coverUrl = album.cover_url || "/default-cover.jpg";
  const albumType = album.album_type || "ALBUM";
  const artistName = album.artist_name || "Artisans";
  const releaseYear = album.release_date
    ? formatDate(album.release_date, "yearOnly")
    : "2026";
  const totalTracks = album.total_tracks || 0;

  return (
    <div className="relative w-full md:h-[40vh] min-h-[340px] bg-gradient-to-b from-neutral-600 to-background px-4 sm:px-6 pt-20 md:pt-24 pb-6 flex items-end">
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 z-10 w-full mt-auto">
        {/* Ảnh bìa - Thu nhỏ lại trên mobile, to dần trên màn hình lớn */}
        <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-60 lg:h-60 shadow-[0_4px_60px_rgba(0,0,0,0.5)] shrink-0 self-start md:self-auto group">
          <Image
            src={coverUrl}
            alt={album.title}
            fill
            className="object-cover rounded-md"
          />
        </div>

        {/* Thông tin Album */}
        <div className="flex flex-col gap-1 md:gap-2 text-white w-full">
          <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase drop-shadow-md tracking-wider">
            {albumType}
          </span>

          {/* Tên Album: Rớt dòng tối đa 3 dòng trên mobile thay vì bị ẩn */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter pb-1 md:pb-2 drop-shadow-lg line-clamp-3 leading-tight md:leading-none">
            {album.title}
          </h1>

          {/* Siêu dữ liệu (Metadata): Gọn gàng, mờ dần theo cấp độ để tôn thông tin chính */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium mt-1 md:mt-2 flex-wrap">
            <span className="font-bold hover:underline cursor-pointer drop-shadow-md">
              {artistName}
            </span>
            <span className="text-white/70">• {releaseYear}</span>
            <span className="text-white/70">• {totalTracks} bài hát,</span>
            <span className="text-white/50 font-normal">
              khoảng {totalMins} phút
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
