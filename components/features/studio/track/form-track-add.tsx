"use client";

import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SuccessModal } from "@/components/shared/modals";
import { TrackFormMetadata } from "./track-form-metadata";
import { TrackFormMedia } from "./track-form-media";
import {
  processAndSaveSong,
  searchTracksAction,
} from "@/app/actions/track.action";
import { createClient } from "@/utils/supabase/client";

// Import hàm làm sạch tên file
import { slugify } from "@/utils/helpers";

export interface TrackNewFormValues {
  trackName?: string;
  artistName?: string;
  trackNumber: number;
}

interface FormTrackAddProps {
  albumId: string;
}

export function FormTrackAdd({ albumId }: FormTrackAddProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [customError, setCustomError] = useState("");

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isManual, setIsManual] = useState(false);

  const { data: suggestedTrackNumber = 1 } = useQuery({
    queryKey: ["suggest-track-number", albumId],
    queryFn: async () => {
      const { data } = await supabase
        .from("tracks")
        .select("track_number")
        .eq("album_id", albumId)
        .order("track_number", { ascending: true });
      if (!data || data.length === 0) return 1;
      const existing = data.map((t) => t.track_number);
      for (let i = 1; i <= existing.length + 1; i++) {
        if (!existing.includes(i)) return i;
      }
      return existing.length + 1;
    },
  });

  const form = useForm<TrackNewFormValues>({
    values: {
      trackName: "",
      artistName: "",
      trackNumber: suggestedTrackNumber,
    },
  });

  const handleSearchItunes = async () => {
    const tName = form.getValues("trackName");
    const aName = form.getValues("artistName");

    setCustomError("");
    setIsSearching(true);
    const res = await searchTracksAction(tName, aName);
    setIsSearching(false);

    if (res.success && res.data) {
      setSearchResults(res.data);
      if (res.data.length === 0) {
        setCustomError("Không tìm thấy trên iTunes, vui lòng Nhập Thủ Công.");
      }
    } else {
      setCustomError(res.error || "Lỗi kết nối iTunes.");
    }
  };

  const createTrackMutation = useMutation({
    mutationFn: async (values: TrackNewFormValues) => {
      if (!audioFile) throw new Error("Vui lòng chọn file âm thanh (MP3)!");
      if (!isManual && !selectedTrack)
        throw new Error(
          "Vui lòng chọn 1 kết quả từ iTunes hoặc Bật chế độ Nhập thủ công!",
        );

      // ==========================================
      // ĐỒNG BỘ: TẠO TÊN FILE VÀ THƯ MỤC CHUẨN XÁC
      // ==========================================
      const originalName = audioFile.name.split(".").slice(0, -1).join(".");
      const fileExt = audioFile.name.split(".").pop();
      const safeName = slugify(originalName);

      const fileName = `${safeName}-${Date.now()}.${fileExt}`;
      const filePath = `audio/albums/${albumId}/${fileName}`;
      // ==========================================

      const { error: uploadError } = await supabase.storage
        .from("songs_bucket")
        .upload(filePath, audioFile);

      if (uploadError)
        throw new Error(`Lỗi tải file lên Storage: ${uploadError.message}`);

      const finalTitle = isManual ? values.trackName : selectedTrack.title;
      const finalArtist = isManual
        ? values.artistName
        : selectedTrack.artist_name;
      const itunesId = isManual ? undefined : selectedTrack.itunes_id;

      const result = await processAndSaveSong({
        audioPath: filePath,
        albumId: albumId,
        trackNumber: Number(values.trackNumber),
        fileDuration: audioDuration || 180,
        title: finalTitle,
        artistName: finalArtist,
        itunesTrackId: itunesId,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks", albumId] });
      setTimeout(() => router.push(`/studio/${albumId}/tracks`), 1500);
    },
    onError: (err: any) => {
      setCustomError(err.message);
    },
  });

  const currentStatus = createTrackMutation.isPending
    ? "submitting"
    : createTrackMutation.isSuccess
      ? "success"
      : "idle";

  return (
    <Fragment>
      {customError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {customError}
        </div>
      )}

      <form
        onSubmit={form.handleSubmit((data) => createTrackMutation.mutate(data))}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <TrackFormMedia
          audioFile={audioFile}
          setAudioFile={setAudioFile}
          setDuration={setAudioDuration}
        />

        <TrackFormMetadata
          form={form}
          status={currentStatus}
          onSearch={handleSearchItunes}
          isSearching={isSearching}
          searchResults={searchResults}
          selectedTrack={selectedTrack}
          setSelectedTrack={setSelectedTrack}
          isManual={isManual}
          setIsManual={setIsManual}
        />
      </form>

      <SuccessModal
        isOpen={createTrackMutation.isSuccess}
        title="Thêm bài hát thành công!"
        description="Bài hát đã được lưu và đồng bộ. Đang chuyển hướng..."
        onConfirm={() => {}}
      />
    </Fragment>
  );
}
