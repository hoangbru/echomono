"use server";

import { createClient } from "@/utils/supabase/server";
import { searchAlbumItunes } from "@/lib/itunes";
import { searchAlbumsListItunes } from "@/lib/itunes";

interface ProcessAlbumParams {
  albumName: string;
  artistName?: string;
  albumType: string;
  isPublished: boolean;
  isExplicit: boolean;
}

interface UpdateAlbumParams {
  id: string;
  itunes_album_id?: string;
  title: string;
  artist_name?: string;
  cover_url: string;
  release_date?: string;
  total_tracks?: number;
  album_type: string;
  is_published: boolean;
  is_explicit: boolean;
}

export async function searchAlbumsAction(
  albumName: string,
  artistName?: string,
) {
  try {
    const results = await searchAlbumsListItunes(albumName, artistName);
    return { success: true, data: results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processAndSaveAlbum(params: ProcessAlbumParams) {
  const supabase = createClient();

  try {
    // 1. Fetch metadata từ iTunes
    const itunesData = await searchAlbumItunes(
      params.albumName,
      params.artistName,
    );

    // 2. Chuẩn bị Object kết hợp
    const newAlbum = {
      // Dữ liệu lấy tự động từ iTunes
      itunes_album_id: itunesData.itunes_id,
      title: itunesData.title,
      artist_name: itunesData.artist_name,
      cover_url: itunesData.cover_url,
      release_date: itunesData.release_date,
      total_tracks: itunesData.total_tracks,

      // Dữ liệu từ Form nhập tay
      album_type: params.albumType,
      is_published: params.isPublished,
      is_explicit: params.isExplicit,
    };

    // 3. Insert vào Supabase
    const { data, error } = await supabase
      .from("albums")
      .insert([newAlbum])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Album Error:", error);
      throw new Error(`Lỗi lưu CSDL: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error("Lỗi khi tạo Album:", error);
    throw new Error(error.message || "Đã xảy ra lỗi khi đồng bộ Album.");
  }
}

export async function updateAlbumAction(params: UpdateAlbumParams) {
  const supabase = createClient();

  try {
    const { id, ...updateData } = params;

    const { data, error } = await supabase
      .from("albums")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
