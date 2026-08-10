"use server";

import { createClient } from "@/utils/supabase/server";
import { searchTracksListItunes } from "@/lib/itunes";
import { fetchLyrics } from "@/lib/lrclib";

interface ProcessSongParams {
  audioPath: string;
  albumId: string;
  trackNumber: number;
  fileDuration: number;
  // Các field metadata nhận từ Frontend
  title: string;
  artistName?: string;
  itunesTrackId?: string;
}

interface UpdateSongParams {
  id: string;
  albumId: string;
  trackName: string;
  artistName?: string;
  audioPath?: string; // Có thể có hoặc không nếu không đổi file nhạc
  trackNumber: number;
  fileDuration?: number;
  lyrics?: string;
}

export async function searchTracksAction(
  trackName: string,
  artistName?: string,
) {
  try {
    const results = await searchTracksListItunes(trackName, artistName);
    return { success: true, data: results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processAndSaveSong(params: ProcessSongParams) {
  const supabase = createClient();

  try {
    // SỬA Ở ĐÂY: Làm tròn thành số nguyên tuyệt đối
    const durationMs = Math.round(params.fileDuration * 1000);

    // Vẫn gọi đồng bộ Lyrics bằng thông tin chốt cuối cùng
    const lyrics = await fetchLyrics(
      params.title,
      params.artistName || "", // Đảm bảo không truyền undefined vào LRCLIB
      durationMs,
    ).catch(() => undefined); // Tránh văng lỗi nếu không có lyrics

    const newSong = {
      itunes_track_id: params.itunesTrackId || null,
      title: params.title,
      artist_name: params.artistName,
      audio_path: params.audioPath,
      duration_ms: durationMs, // Lúc này chắc chắn là số nguyên (VD: 196987)
      lyrics: lyrics,
      album_id: params.albumId,
      track_number: params.trackNumber,
    };

    const { data, error } = await supabase
      .from("tracks")
      .insert([newSong])
      .select()
      .single();

    if (error) throw new Error(`Lỗi lưu DB: ${error.message}`);
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Đã xảy ra lỗi khi đồng bộ bài hát.");
  }
}

export async function updateSongAction(params: UpdateSongParams) {
  const supabase = createClient();
  try {
    const updateData: any = {
      title: params.trackName,
      artist_name: params.artistName,
      track_number: params.trackNumber,
      lyrics: params.lyrics, // Ghi đè lyrics mới
    };

    if (params.audioPath) updateData.audio_path = params.audioPath;
    if (params.fileDuration) updateData.duration_ms = params.fileDuration;

    const { data, error } = await supabase
      .from("tracks")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
