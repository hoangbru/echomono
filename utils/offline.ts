import { set, get, del } from "idb-keyval";
import { Track } from "@/hooks/use-player";

export async function getOfflineTracks(): Promise<Track[]> {
  return (await get("offline_tracks")) || [];
}

export async function downloadAudioForOffline(track: Track): Promise<boolean> {
  try {
    // 1. Tải file âm thanh dưới dạng dữ liệu thô (Blob)
    const audioResponse = await fetch(track.audioUrl);
    if (!audioResponse.ok) throw new Error("Không thể tải nhạc");
    const audioBlob = await audioResponse.blob();

    // Tải ảnh bìa dạng Blob
    let coverBlob = null;
    if (track.imageUrl && !track.imageUrl.startsWith("/")) {
      const coverResponse = await fetch(track.imageUrl);
      if (coverResponse.ok) coverBlob = await coverResponse.blob();
    }

    // 2. Lưu trực tiếp Blob vào IndexedDB
    // Lưu file MP3
    await set(`audio_blob_${track.id}`, audioBlob);

    // Lưu file Ảnh bìa
    if (coverBlob) {
      await set(`cover_blob_${track.id}`, coverBlob);
    }

    // 3. Lưu Metadata (Thông tin bài hát)
    const offlineTracks: Track[] = (await get("offline_tracks")) || [];
    if (!offlineTracks.find((t) => t.id === track.id)) {
      offlineTracks.push(track);
      await set("offline_tracks", offlineTracks);
    }

    return true;
  } catch (error) {
    console.error("Lỗi tải nhạc:", error);
    return false;
  }
}

export async function removeOfflineTrack(track: Track): Promise<boolean> {
  try {
    const offlineTracks: Track[] = (await get("offline_tracks")) || [];
    const newTracks = offlineTracks.filter((t) => t.id !== track.id);
    await set("offline_tracks", newTracks);

    // Xóa Blob khỏi bộ nhớ
    await del(`audio_blob_${track.id}`);
    await del(`cover_blob_${track.id}`);

    return true;
  } catch (error) {
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
    const cache = await caches.open("echo-offline-audio-v1");
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
