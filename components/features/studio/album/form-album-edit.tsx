"use client";

import { Fragment, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SuccessModal } from "@/components/shared/modals";
import { AlbumFormMedia } from "./album-form-media";
import { AlbumFormMetadata } from "./album-form-metadata";
import {
  searchAlbumsAction,
  updateAlbumAction,
} from "@/app/actions/album.action";
import { createClient } from "@/utils/supabase/client";

export interface AlbumEditFormValues {
  albumName?: string;
  artistName?: string;
  albumType: string;
  isPublished: boolean;
  isExplicit: boolean;
}

interface FormAlbumEditProps {
  albumId: string;
}

export function FormAlbumEdit({ albumId }: FormAlbumEditProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [customError, setCustomError] = useState("");

  // 1. Fetch dữ liệu cũ của Album
  const { data: currentAlbum, isLoading } = useQuery({
    queryKey: ["album-detail", albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const form = useForm<AlbumEditFormValues>({
    defaultValues: {
      albumName: "",
      artistName: "",
      albumType: "ALBUM",
      isPublished: true,
      isExplicit: false,
    },
  });

  // Đổ dữ liệu cũ vào form và set ảnh bìa mặc định ban đầu
  useEffect(() => {
    if (currentAlbum) {
      form.reset({
        albumName: currentAlbum.title || "",
        artistName: currentAlbum.artist_name || "",
        albumType: currentAlbum.album_type || "ALBUM",
        isPublished: currentAlbum.is_published ?? true,
        isExplicit: currentAlbum.is_explicit ?? false,
      });

      setSelectedAlbum({
        itunes_id: currentAlbum.itunes_album_id || "",
        title: currentAlbum.title,
        artist_name: currentAlbum.artist_name,
        cover_url: currentAlbum.cover_url,
        release_date: currentAlbum.release_date,
        total_tracks: currentAlbum.total_tracks,
      });
    }
  }, [currentAlbum, form]);

  // 2. Hàm tìm kiếm qua iTunes
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
        setCustomError("Không tìm thấy Album nào phù hợp.");
      }
    } else {
      setCustomError(res.error || "Lỗi khi kết nối đến iTunes.");
    }
  };

  // 3. Mutation cập nhật Album
  const updateMutation = useMutation({
    mutationFn: async (values: AlbumEditFormValues) => {
      if (!selectedAlbum)
        throw new Error("Chưa có thông tin ảnh bìa hoặc album được chọn!");

      const payload = {
        id: albumId,
        itunes_album_id: selectedAlbum.itunes_id,
        title: values.albumName || selectedAlbum.title,
        artist_name: values.artistName || selectedAlbum.artist_name,
        cover_url: selectedAlbum.cover_url,
        release_date: selectedAlbum.release_date,
        total_tracks: selectedAlbum.total_tracks,
        album_type: values.albumType,
        is_published: values.isPublished,
        is_explicit: values.isExplicit,
      };

      const res = await updateAlbumAction(payload);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["album-detail", albumId] });
      setTimeout(() => router.push(`/studio/${albumId}/tracks`), 1500);
    },
    onError: (err: any) => {
      setCustomError(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Đang tải thông tin Album...
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

      {/* TÁI SỬ DỤNG HOÀN TOÀN CÁC COMPONENT CON Y HỆT BÊN ADD */}
      <form
        onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
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
        />
      </form>

      <SuccessModal
        isOpen={updateMutation.isSuccess}
        title="Cập nhật Album thành công!"
        description="Đang chuyển hướng về trang danh sách bài hát..."
        onConfirm={() => {}}
      />
    </Fragment>
  );
}
