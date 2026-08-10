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
  albumName?: string;
  artistName?: string;
  albumType: string;
  isPublished: boolean;
  isExplicit: boolean;
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
    },
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [customError, setCustomError] = useState("");

  // 1. Hàm gọi tìm kiếm linh hoạt (Có thể tìm bằng Tên Nghệ sĩ hoặc Tên Album)
  const handleSearch = async () => {
    const albumName = form.getValues("albumName");
    const artistName = form.getValues("artistName");

    // Kiểm tra nếu cả 2 ô đều trống thì báo lỗi
    if (!albumName && !artistName) {
      setCustomError(
        "Vui lòng nhập ít nhất Tên Nghệ sĩ hoặc Tên Album để tìm kiếm!",
      );
      return;
    }

    setCustomError("");
    setIsSearching(true);
    // Gọi action truyền cả 2 giá trị để hàm search mới bên lib/itunes xử lý linh hoạt
    const res = await searchAlbumsAction(albumName, artistName);
    setIsSearching(false);

    if (res.success && res.data) {
      setSearchResults(res.data);
      if (res.data.length > 0) {
        setSelectedAlbum(res.data[0]); // Mặc định chọn kết quả đầu tiên trong danh sách
      } else {
        setCustomError("Không tìm thấy Album nào phù hợp với từ khóa này.");
      }
    } else {
      setCustomError(res.error || "Không tìm thấy kết quả phù hợp.");
    }
  };

  // 2. Mutation Lưu Album đã chọn xuống Supabase
  const createAlbumMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAlbum)
        throw new Error("Vui lòng tìm và chọn một Album từ danh sách kết quả!");

      const values = form.getValues();
      const newAlbum = {
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

  // Tính toán trạng thái form để truyền vào nút Submit
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
        {/* Cột trái: Hiển thị danh sách ảnh bìa kết quả tìm kiếm để Admin chọn */}
        <AlbumFormMedia
          searchResults={searchResults}
          selectedAlbum={selectedAlbum}
          onSelectAlbum={setSelectedAlbum}
          isSearching={isSearching}
        />

        {/* Cột phải: Khung nhập liệu thông tin metadata */}
        <AlbumFormMetadata
          form={form}
          status={currentStatus}
          onSearch={handleSearch}
        />
      </form>

      <SuccessModal
        isOpen={createAlbumMutation.isSuccess}
        title="Tạo Album thành công!"
        description="Đang chuyển hướng đến trang thêm album..."
        onConfirm={() => {}}
      />
    </Fragment>
  );
}
