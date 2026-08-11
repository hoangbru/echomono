// app/studio/[albumId]/tracks/edit/[trackId]/form-track-edit.tsx
"use client";

import { Fragment, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SuccessModal } from "@/components/shared/modals";
import { updateSongAction } from "@/app/actions/track.action";
import { createClient } from "@/utils/supabase/client";
import { TrackFormMedia } from "./track-form-media";
import { TrackFormMetadata } from "./track-form-metadata";
import { slugify } from "@/utils/helpers";

// Interface đã được tối giản
export interface TrackEditFormValues {
  trackName: string;
  artistName?: string;
  trackNumber: number;
  lyrics?: string;
}

interface FormTrackEditProps {
  albumId: string;
  trackId: string;
}

export function FormTrackEdit({ albumId, trackId }: FormTrackEditProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [customError, setCustomError] = useState("");

  const { data: trackData, isLoading } = useQuery({
    queryKey: ["track-detail", trackId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("id", trackId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const form = useForm<TrackEditFormValues>({
    defaultValues: {
      trackName: "",
      artistName: "",
      trackNumber: 1,
      lyrics: "",
    },
  });

  useEffect(() => {
    if (trackData) {
      form.reset({
        trackName: trackData.title || "",
        artistName: trackData.artist_name || "",
        trackNumber: trackData.track_number || 1,
        lyrics: trackData.lyrics || "",
      });
    }
  }, [trackData, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: TrackEditFormValues) => {
      let newAudioPath: string | undefined = undefined;

      // Lấy đường dẫn file cũ đang lưu trong DB
      const oldAudioPath = trackData?.audio_path;

      if (newAudioFile) {
        // 1. Tách tên file gốc và đuôi mở rộng
        const originalName = newAudioFile.name
          .split(".")
          .slice(0, -1)
          .join(".");
        const fileExt = newAudioFile.name.split(".").pop();

        // 2. Dùng helper để làm sạch tên file
        const safeName = slugify(originalName);

        // 3. Đặt tên file hoàn chỉnh: [tên-gốc-đã-làm-sạch]-[timestamp].[đuôi]
        const fileName = `${safeName}-${Date.now()}.${fileExt}`;

        // TỔ CHỨC LẠI: Nằm gọn trong thư mục Album
        newAudioPath = `audio/albums/${albumId}/${fileName}`;

        // Upload file mới
        const { error: uploadError } = await supabase.storage
          .from("songs_bucket")
          .upload(newAudioPath, newAudioFile);

        if (uploadError)
          throw new Error(`Lỗi tải file mới: ${uploadError.message}`);

        // Dọn rác file cũ
        if (oldAudioPath) {
          const { error: deleteError } = await supabase.storage
            .from("songs_bucket")
            .remove([oldAudioPath]);

          if (deleteError) {
            console.warn("Không thể xóa file rác cũ:", deleteError);
          }
        }
      }

      // 3. Cập nhật Database
      const res = await updateSongAction({
        id: trackId,
        albumId: albumId,
        trackName: values.trackName,
        artistName: values.artistName,
        audioPath: newAudioPath,
        trackNumber: Number(values.trackNumber),
        fileDuration: audioDuration > 0 ? audioDuration : undefined,
        lyrics: values.lyrics,
      });

      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks", albumId] });
      queryClient.invalidateQueries({ queryKey: ["track-detail", trackId] });
      setTimeout(() => router.push(`/studio/${albumId}/tracks`), 1500);
    },
    onError: (err: any) => {
      setCustomError(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Đang tải thông tin bài hát...
      </div>
    );
  }

  const currentStatus = updateMutation.isPending
    ? "submitting"
    : updateMutation.isSuccess
      ? "success"
      : updateMutation.isError || customError
        ? "error"
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
        onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <TrackFormMedia
          audioFile={newAudioFile}
          setAudioFile={setNewAudioFile}
          setDuration={setAudioDuration}
          existingAudioPath={trackData?.audio_path}
        />

        {/* Cần đánh dấu isEditMode = true để ẩn phần tìm kiếm iTunes nếu muốn */}
        <TrackFormMetadata
          form={form as any}
          status={currentStatus}
          isEditMode={true} // Bổ sung prop này
        />
      </form>

      <SuccessModal
        isOpen={updateMutation.isSuccess}
        title="Cập nhật bài hát thành công!"
        description="Đang chuyển hướng về danh sách..."
        onConfirm={() => {}}
      />
    </Fragment>
  );
}
