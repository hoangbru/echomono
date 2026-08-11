"use client";

import { createClient } from "@/utils/supabase/client";

interface TrackFormMediaProps {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  setDuration: (duration: number) => void;
  existingAudioPath?: string;
}

export function TrackFormMedia({
  audioFile,
  setAudioFile,
  setDuration,
  existingAudioPath,
}: TrackFormMediaProps) {
  const supabase = createClient();

  return (
    <div className="col-span-1">
      <div className="bg-card p-6 rounded-2xl border border-white/10 h-full flex flex-col justify-between space-y-6">
        <div>
          {/* Nếu là Edit và có file cũ, hiển thị trình nghe thử file cũ */}
          {existingAudioPath && (
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-300 block mb-2">
                Âm thanh hiện tại
              </label>
              <div className="bg-background p-3 rounded-xl border border-white/5 space-y-2">
                <p className="text-[10px] text-muted-foreground truncate">
                  {existingAudioPath}
                </p>
                <audio
                  controls
                  className="w-full h-9 accent-primary"
                  src={
                    supabase.storage
                      .from("songs_bucket")
                      .getPublicUrl(existingAudioPath).data.publicUrl
                  }
                />
              </div>
            </div>
          )}

          <label className="text-sm font-bold text-primary block mb-2">
            {existingAudioPath
              ? "Thay file MP3 mới (Tùy chọn)"
              : "File âm thanh (MP3) *"}
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAudioFile(file);
                const audio = document.createElement("audio");
                audio.src = URL.createObjectURL(file);

                audio.onloadedmetadata = () => {
                  // ĐÃ SỬA DÒNG NÀY: Nhân 1000 để ra mili-giây và làm tròn thành số nguyên tuyệt đối
                  setDuration(Math.round(audio.duration * 1000));
                };
              }
            }}
            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-accent hover:file:cursor-pointer"
          />
        </div>

        {/* Nghe thử file mới vừa chọn */}
        {audioFile && (
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 space-y-2">
            <p className="text-[11px] text-primary font-medium truncate">
              File mới chọn: {audioFile.name}
            </p>
            <audio
              controls
              className="w-full h-9 accent-primary"
              src={URL.createObjectURL(audioFile)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
