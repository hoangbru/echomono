import { set, get } from "idb-keyval";
import { Track } from "@/hooks/use-player";

// Dùng cho trang "Thư viện Offline"
export async function getOfflineTracks(): Promise<Track[]> {
  return (await get("offline_tracks")) || [];
}

async function saveMetadataToIndexedDB(track: Track): Promise<void> {
  // Lấy danh sách nhạc offline hiện có
  const offlineTracks: Track[] = (await get("offline_tracks")) || [];

  // Tránh lưu trùng lặp
  if (!offlineTracks.find((t) => t.id === track.id)) {
    offlineTracks.push(track);
    await set("offline_tracks", offlineTracks);
  }
}

export async function downloadAudioForOffline(track: Track): Promise<boolean> {
  try {
    // 1. Mở một "kho" riêng trong Cache Storage
    const cache = await caches.open("musichub-offline-audio-v1");

    // 2. Fetch file MP3 và Ảnh bìa từ URL đầy đủ
    const audioResponse = await fetch(track.audioUrl);

    // Nếu có imageUrl thì mới tải ảnh
    let coverResponse: Response | null = null;
    if (track.imageUrl && !track.imageUrl.startsWith("/")) {
      coverResponse = await fetch(track.imageUrl);
    }

    if (!audioResponse.ok) throw new Error("Không thể tải file nhạc");

    // 3. Cất file MP3 và Ảnh vào kho
    await cache.put(track.audioUrl, audioResponse);
    if (coverResponse && coverResponse.ok && track.imageUrl) {
      await cache.put(track.imageUrl, coverResponse);
    }

    // 4. Lưu metadata vào IndexedDB
    await saveMetadataToIndexedDB(track);

    return true;
  } catch (error) {
    console.error("Lỗi tải nhạc:", error);
    return false;
  }
}

export async function removeOfflineTrack(track: Track): Promise<boolean> {
  try {
    // 1. Xóa khỏi danh sách trong IndexedDB
    const offlineTracks: Track[] = (await get("offline_tracks")) || [];
    const newTracks = offlineTracks.filter((t) => t.id !== track.id);
    await set("offline_tracks", newTracks);

    // 2. Mở kho Cache Storage và xóa file âm thanh + ảnh bìa
    const cache = await caches.open("musichub-offline-audio-v1");
    await cache.delete(track.audioUrl);

    if (track.imageUrl && !track.imageUrl.startsWith("/")) {
      await cache.delete(track.imageUrl);
    }

    return true;
  } catch (error) {
    console.error("Lỗi xóa nhạc offline:", error);
    return false;
  }
}

export async function removeOfflineAlbum(albumId: string): Promise<boolean> {
  try {
    const offlineTracks: Track[] = (await get("offline_tracks")) || [];

    // Tách làm 2 danh sách: Giữ lại và Xóa đi
    const tracksToKeep = offlineTracks.filter((t) => t.albumId !== albumId);
    const tracksToDelete = offlineTracks.filter((t) => t.albumId === albumId);

    // Cập nhật lại IndexedDB
    await set("offline_tracks", tracksToKeep);

    // Xóa file MP3 khỏi Cache Storage
    const cache = await caches.open("musichub-offline-audio-v1");
    for (const track of tracksToDelete) {
      await cache.delete(track.audioUrl);
      // Chú ý: Ta không xóa ảnh bìa (imageUrl) ở đây vì có thể các bài hát khác (Single) đang dùng chung ảnh này
    }

    return true;
  } catch (error) {
    console.error("Lỗi xóa album offline:", error);
    return false;
  }
}
