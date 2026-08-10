import { removeVietnameseTones } from "@/utils/helpers";

export const searchAlbumItunes = async (
  albumName: string,
  artistName?: string,
) => {
  // Gom Tên Album và Tên Nghệ sĩ lại để tìm cho chính xác
  const query = encodeURIComponent(`${albumName} ${artistName || ""}`.trim());

  // Gọi API của Apple (entity=album giới hạn kết quả trả về là Album)
  const response = await fetch(
    `https://itunes.apple.com/search?term=${query}&entity=album&limit=1`,
  );

  if (!response.ok) {
    throw new Error("Không thể kết nối đến máy chủ iTunes.");
  }

  const data = await response.json();

  if (data.resultCount === 0) {
    throw new Error(
      `Không tìm thấy Album "${albumName}" trên hệ thống. Hãy thử nhập thêm tên nghệ sĩ.`,
    );
  }

  const album = data.results[0];

  // Mẹo: iTunes mặc định trả về ảnh 100x100 rất mờ. Chúng ta đổi chuỗi để lấy ảnh 600x600 siêu nét!
  const highResCover = album.artworkUrl100.replace("100x100bb", "600x600bb");

  return {
    itunes_id: album.collectionId.toString(),
    title: album.collectionName,
    artist_name: album.artistName,
    cover_url: highResCover,
    release_date: album.releaseDate.split("T")[0], // Cắt lấy YYYY-MM-DD
    total_tracks: album.trackCount,
  };
};

export const searchAlbumsListItunes = async (
  albumName?: string,
  artistName?: string,
) => {
  try {
    let artistId: string | null = null;

    // BƯỚC 1: Nếu có nhập tên nghệ sĩ, ưu tiên đi tìm ID chính xác của nghệ sĩ đó trước
    if (artistName) {
      const cleanArtist = removeVietnameseTones(artistName);
      const artistUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
        cleanArtist,
      )}&media=music&entity=musicArtist&country=VN&limit=5`;

      const artistRes = await fetch(artistUrl);
      if (artistRes.ok) {
        const artistData = await artistRes.json();
        if (artistData.resultCount > 0) {
          // Lấy ID của nghệ sĩ khớp nhất
          artistId = artistData.results[0].artistId.toString();
        }
      }
    }

    let rawResults: any[] = [];

    // BƯỚC 2: Nếu tìm được artistId, dùng endpoint lookup để lấy toàn bộ Album CHÍNH CHỦ của nghệ sĩ đó
    if (artistId) {
      const lookupUrl = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&country=VN&limit=50`;
      const lookupRes = await fetch(lookupUrl);
      if (lookupRes.ok) {
        const lookupData = await lookupRes.json();
        // Kết quả trả về từ lookup: phần tử đầu tiên là Artist, các phần tử sau là Album
        rawResults = lookupData.results.filter(
          (item: any) => item.wrapperType === "collection",
        );
      }
    }

    // BƯỚC 3: Fallback (Phòng hờ không tìm ra artistId hoặc chỉ nhập mỗi tên Album)
    if (rawResults.length === 0) {
      const searchTerm = [artistName, albumName]
        .filter(Boolean)
        .join(" ")
        .trim();
      const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
        removeVietnameseTones(searchTerm),
      )}&media=music&entity=album&country=VN&lang=vi_vn&limit=25`;

      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        rawResults = searchData.results || [];
      }
    }

    if (rawResults.length === 0) return [];

    // Nếu người dùng có nhập thêm tên album cụ thể (ví dụ: tìm "Obito" nhưng chỉ muốn lọc album "Đánh Đổi"),
    // chúng ta lọc thêm một lớp ở client cho cực kỳ chuẩn xác
    if (albumName) {
      const unsignedAlbum = removeVietnameseTones(albumName).toLowerCase();
      const filtered = rawResults.filter((album: any) =>
        removeVietnameseTones(album.collectionName || "")
          .toLowerCase()
          .includes(unsignedAlbum),
      );
      // Nếu có album khớp tên thì lấy bản khớp, không thì giữ nguyên danh sách gốc của nghệ sĩ
      if (filtered.length > 0) {
        rawResults = filtered;
      }
    }

    // Map dữ liệu sạch sẽ trả về UI
    const uniqueMap = new Map();
    rawResults.forEach((album: any) => {
      if (album.collectionId && !uniqueMap.has(album.collectionId)) {
        uniqueMap.set(album.collectionId, {
          itunes_id: album.collectionId.toString(),
          title: album.collectionName,
          artist_name: album.artistName,
          cover_url: album.artworkUrl100
            ? album.artworkUrl100.replace("100x100bb", "600x600bb")
            : "/default-cover.jpg",
          release_date: album.releaseDate
            ? album.releaseDate.split("T")[0]
            : "",
          total_tracks: album.trackCount || 0,
        });
      }
    });

    return Array.from(uniqueMap.values());
  } catch (error) {
    console.error("Lỗi iTunes Search:", error);
    return [];
  }
};

// Hàm hỗ trợ format data để code gọn hơn
const formatItunesResults = (results: any[]) => {
  return results.slice(0, 10).map((t: any) => ({
    itunes_id: t.trackId.toString(),
    title: t.trackName,
    artist_name: t.artistName,
    album_name: t.collectionName || "Single",
    cover_url: t.artworkUrl100
      ? t.artworkUrl100.replace("100x100bb", "600x600bb")
      : "/default-cover.jpg",
  }));
};

export const searchTracksListItunes = async (
  trackName?: string,
  artistName?: string,
) => {
  try {
    // 1. Gộp tên bài hát và nghệ sĩ thành 1 từ khóa duy nhất (Ví dụ: "Chạy Ngay Đi Sơn Tùng")
    const searchTerm = [trackName, artistName].filter(Boolean).join(" ").trim();

    // 2. TÌM LẦN 1: Giữ nguyên có dấu (iTunes hiện tại tìm có dấu rất tốt)
    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      searchTerm,
    )}&media=music&entity=song&country=VN&limit=50`; // Đổi thành entity=song

    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error("Lỗi kết nối API iTunes");

    const data = await response.json();
    let rawTracks = data.results || [];

    // 3. TÌM LẦN 2 (Fallback): Nếu có dấu không ra, thử bỏ dấu tiếng Việt đi để tìm lại
    if (rawTracks.length === 0) {
      const cleanTerm = removeVietnameseTones(searchTerm);
      const fallbackUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
        cleanTerm,
      )}&media=music&entity=song&country=VN&limit=50`;

      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      rawTracks = fallbackData.results || [];
    }

    // 4. Format và trả về kết quả
    return formatItunesResults(rawTracks);
  } catch (error: any) {
    console.error("Lỗi iTunes Search:", error);
    throw new Error("Không thể kết nối đến máy chủ iTunes.");
  }
};
