"use client";

import { Fragment, useState } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { AlbumItem } from "./album-item";
import { AlbumItemSkeleton } from "./album-skeleton";
import { ConfirmModal } from "@/components/shared/modals";

import { createClient } from "@/utils/supabase/client";

export function AlbumGrid() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [albumToDelete, setAlbumToDelete] = useState<any | null>(null);

  const {
    data: albums = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
  });

  // 2. Mutation Xóa Album
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Do đã cấu hình "on delete cascade" ở Database nên khi xóa Album,
      // toàn bộ bài hát (tracks) thuộc album này cũng sẽ tự động bay màu
      const { error } = await supabase.from("albums").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      setAlbumToDelete(null);
    },
  });

  const executeDelete = () => {
    if (albumToDelete) {
      deleteMutation.mutate(albumToDelete.id);
    }
  };

  return (
    <Fragment>
      <div
        className={`transition-opacity duration-200 ${
          deleteMutation.isPending ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
            {Array.from({ length: 10 }).map((_, idx) => (
              <AlbumItemSkeleton key={idx} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-red-500/20 mt-8 gap-4">
            <AlertCircle className="w-10 h-10 text-red-500/50" />
            <p className="text-red-400 font-medium">
              Đã có lỗi xảy ra khi tải danh sách Album.
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="border-white/10 text-gray-300 hover:text-white"
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Thử lại
            </Button>
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-white/5 mt-8">
            <p className="text-gray-500">
              Không tìm thấy Album nào. Hãy tạo mới ngay!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
            {albums.map((album: any) => (
              <AlbumItem
                key={album.id}
                album={album}
                onDelete={setAlbumToDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!albumToDelete}
        onClose={() => setAlbumToDelete(null)}
        onConfirm={executeDelete}
        title="Xóa Album này?"
        description={
          <>
            Bạn có chắc muốn xóa Album{" "}
            <span className="text-white font-bold">
              "{albumToDelete?.title}"
            </span>{" "}
            không? Hành động này sẽ xóa vĩnh viễn toàn bộ bài hát bên trong.
          </>
        }
        confirmText="Xác nhận xóa"
        cancelText="Huỷ"
        isProcessing={deleteMutation.isPending}
      />
    </Fragment>
  );
}
