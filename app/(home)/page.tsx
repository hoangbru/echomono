import { AlbumCard } from "@/components/shared/cards";
import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = createClient();

  // Truy vấn lấy danh sách album thịnh hành từ Supabase
  const { data: trendingAlbums, error } = await supabase
    .from("albums")
    .select("*")
    .eq("is_published", true) // Chỉ lấy album đang công khai
    .order("created_at", { ascending: false }) // Sắp xếp mới nhất

  const albums = trendingAlbums || [];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 md:p-8">
        {albums.length > 0 ? (
          // Sử dụng CSS Grid để chia cột linh hoạt từ Mobile -> Desktop
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {albums.map((al: any) => (
              // Bỏ class min-w max-w để thẻ card tự động giãn vừa khít với lưới Grid
              <AlbumCard key={al.id} album={al} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Chưa có album nào được công khai.
          </p>
        )}
      </div>
    </div>
  );
}
