export interface TrackDetail {
  id: string;
  album_id: string;
  itunes_track_id?: string;
  title: string;
  artist_name?: string;
  audio_path: string;
  duration_ms?: number;
  track_number: number;
  lyrics?: string;
  created_at?: string;
}
