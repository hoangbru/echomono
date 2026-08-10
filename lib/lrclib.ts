export async function fetchLyrics(
  trackName: string,
  artistName: string,
  durationMs: number,
): Promise<string | null> {
  try {
    // LRCLIB yêu cầu thời lượng tính bằng giây (seconds)
    const durationSec = Math.round(durationMs / 1000);

    const params = new URLSearchParams({
      track_name: trackName,
      artist_name: artistName,
      duration: durationSec.toString(),
    });

    const response = await fetch(
      `https://lrclib.net/api/get?${params.toString()}`,
      {
        method: "GET",
        headers: {
          // Đổi tên "MusicHub" thành tên dự án thực tế của bạn
          "User-Agent": "Echo/1.0 (https://github.com/hoangbru/echo)",
        },
      },
    );

    if (!response.ok) {
      console.warn("LRCLIB: Không tìm thấy lời bài hát cho", trackName);
      return null;
    }

    const data = await response.json();

    // Ưu tiên lấy lời đồng bộ (syncedLyrics). Nếu không có, lấy lời tĩnh (plainLyrics)
    return data.syncedLyrics || data.plainLyrics || null;
  } catch (error) {
    console.error("Lỗi khi fetch LRCLIB:", error);
    return null;
  }
}
