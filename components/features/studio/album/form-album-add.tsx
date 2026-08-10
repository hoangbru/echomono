"use client";

import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { SuccessModal } from "@/components/shared/modals";
import { AlbumFormMedia } from "./album-form-media";
import { searchAlbumsAction } from "@/app/actions/album.action";
import { createClient } from "@/utils/supabase/client";
import { AlbumFormMetadata } from "./album-form-metadata";

export interface AlbumNewFormValues {
  albumName: string;
  artistName: string;
  albumType: string;
  isPublished: boolean;
  isExplicit: boolean;
  // Thêm các trường dành cho nhập thủ công
  releaseDate?: string;
  totalTracks?: number;
  coverUrl?: string;
}

export function FormAlbumAdd() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const form = useForm<AlbumNewFormValues>({
    defaultValues: {
      albumName: "",
      artistName: "",
      albumType: "ALBUM",
      isPublished: true,
      isExplicit: false,
      releaseDate: new Date().toISOString().split("T")[0],
      totalTracks: 1,
      coverUrl: "",
    },
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [customError, setCustomError] = useState("");

  // State quản lý chế độ Nhập thủ công
  const [isManual, setIsManual] = useState(false);

  // 1. Hàm gọi tìm kiếm linh hoạt trên iTunes
  const handleSearch = async () => {
    const albumName = form.getValues("albumName");
    const artistName = form.getValues("artistName");

    if (!albumName && !artistName) {
      setCustomError(
        "Vui lòng nhập ít nhất Tên Nghệ sĩ hoặc Tên Album để tìm kiếm!",
      );
      return;
    }

    setCustomError("");
    setIsSearching(true);
    const res = await searchAlbumsAction(albumName, artistName);
    setIsSearching(false);

    if (res.success && res.data) {
      setSearchResults(res.data);
      if (res.data.length > 0) {
        setSelectedAlbum(res.data[0]);
      } else {
        setCustomError(
          "Không tìm thấy Album nào trên iTunes. Vui lòng Bật chế độ Nhập thủ công!",
        );
      }
    } else {
      setCustomError(res.error || "Không tìm thấy kết quả phù hợp.");
    }
  };

  // 2. Mutation Lưu Album xuống Supabase (Xử lý cả 2 chế độ)
  const createAlbumMutation = useMutation({
    mutationFn: async () => {
      // Chặn nếu đang ở chế độ tìm kiếm mà chưa chọn album nào
      if (!isManual && !selectedAlbum) {
        throw new Error(
          "Vui lòng tìm và chọn một Album từ iTunes, hoặc Bật chế độ Nhập thủ công!",
        );
      }

      const values = form.getValues();

      // Bóc tách dữ liệu tùy theo chế độ
      const newAlbum = isManual
        ? {
            title: values.albumName || "Unknown Album",
            artist_name: values.artistName || "Unknown Artist",
            cover_url: values.coverUrl || "/default-cover.jpg",
            release_date:
              values.releaseDate || new Date().toISOString().split("T")[0],
            total_tracks: Number(values.totalTracks) || 1,
            album_type: values.albumType,
            is_published: values.isPublished,
            is_explicit: values.isExplicit,
            itunes_album_id: null, // Nhập tay thì không có ID iTunes
          }
        : {
            itunes_album_id: selectedAlbum.itunes_id,
            title: selectedAlbum.title,
            artist_name: selectedAlbum.artist_name,
            cover_url: selectedAlbum.cover_url,
            release_date: selectedAlbum.release_date,
            total_tracks: selectedAlbum.total_tracks,
            album_type: values.albumType,
            is_published: values.isPublished,
            is_explicit: values.isExplicit,
          };

      const { data, error } = await supabase
        .from("albums")
        .insert([newAlbum])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      setTimeout(() => router.push(`/studio/${data.id}/tracks`), 1500);
    },
    onError: (err: any) => {
      setCustomError(err.message);
    },
  });

  const currentStatus = createAlbumMutation.isPending
    ? "submitting"
    : createAlbumMutation.isSuccess
      ? "success"
      : createAlbumMutation.isError || customError
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
        onSubmit={(e) => {
          e.preventDefault();
          createAlbumMutation.mutate();
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Nếu đang nhập tay, giao diện Ảnh bìa bên trái có thể bỏ trống hoặc hiển thị ảnh default */}
        <AlbumFormMedia
          searchResults={searchResults}
          selectedAlbum={selectedAlbum}
          onSelectAlbum={setSelectedAlbum}
          isSearching={isSearching}
        />

        <AlbumFormMetadata
          form={form}
          status={currentStatus}
          onSearch={handleSearch}
          isManual={isManual}
          setIsManual={setIsManual}
        />
      </form>

      <SuccessModal
        isOpen={createAlbumMutation.isSuccess}
        title="Tạo Album thành công!"
        description="Đang chuyển hướng đến trang thêm bài hát..."
        onConfirm={() => {}}
      />
    </Fragment>
  );
}
