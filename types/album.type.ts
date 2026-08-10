import { AlbumType } from "./enum.type";

export interface AlbumDetail {
  id: string;
  itunes_album_id?: string;
  title: string;
  artist_name?: string;
  cover_url: string;
  release_date?: string;
  total_tracks?: number;
  album_type: AlbumType;
  is_published: boolean;
  is_explicit: boolean;
  record_label?: string;
  created_at?: string;
  updated_at?: string;
}
