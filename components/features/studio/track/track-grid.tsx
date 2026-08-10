"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { AlertCircle, Plus, RefreshCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { ConfirmModal } from "@/components/shared/modals/confirm-modal";
import { TrackRow } from "./track-row";
import { TrackRowSkeleton } from "./track-skeleton";

import { createClient } from "@/utils/supabase/client";

interface TrackGridProps {
  albumId: string;
}

export function TrackGrid({ albumId }: TrackGridProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [trackToDelete, setTrackToDelete] = useState<any | null>(null);

  // 1. Fetch thông tin Album (Để hiển thị Tên Album trên Heading)
  const { data: album } = useQuery({
    queryKey: ["album", albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("title")
        .eq("id", albumId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  // 2. Fetch danh sách Bài hát (tracks) thuộc Album này
  const {
    data: tracks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tracks", albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("album_id", albumId)
        .order("track_number", { ascending: true }); // Rồi sắp xếp theo thứ tự bài

      if (error) throw new Error(error.message);
      return data;
    },
  });

  // 3. Mutation Xóa Bài hát
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Tùy chọn: Bạn có thể thêm logic xóa file Audio trên Supabase Storage ở đây
      // const track = tracks.find(t => t.id === id);
      // if (track?.audio_path) await supabase.storage.from("songs_bucket").remove([track.audio_path]);

      const { error } = await supabase.from("tracks").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks", albumId] });
      setTrackToDelete(null);
    },
  });

  const executeDelete = () => {
    if (trackToDelete) {
      deleteMutation.mutate(trackToDelete.id);
    }
  };

  return (
    <Fragment>
      <div className="flex items-center justify-between">
        <PageHeading>
          Bài hát trong:{" "}
          <Link
            href={`/studio#album-${albumId}`}
            className="text-primary hover:underline hover:text-accent transition-colors"
            title="Quay lại danh sách Album"
          >
            {album?.title || "..."}
          </Link>
        </PageHeading>

        {/* Đã sửa đường dẫn href cho khớp với cấu trúc thư mục thực tế */}
        <Link href={`/studio/${albumId}/tracks/new`}>
          <Button className="bg-primary hover:bg-accent font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <Plus className="w-5 h-5 mr-2" /> Thêm bài hát
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background/50 text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-border/50">
              <th className="py-4 px-4 w-12 text-center">#</th>
              <th className="py-4 px-4">Bài hát</th>
              <th className="py-4 px-4">Nghệ sĩ</th>
              <th className="py-4 px-4">Thời lượng</th>
              <th className="py-4 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-border/50 transition-opacity ${deleteMutation.isPending ? "opacity-50 pointer-events-none" : ""}`}
          >
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TrackRowSkeleton key={idx} />
              ))
            ) : isError ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <AlertCircle className="w-10 h-10 text-red-500/50" />
                    <p className="text-red-400 font-medium">
                      Đã có lỗi xảy ra khi tải danh sách bài hát.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => refetch()}
                      className="border-white/10 text-gray-300 hover:text-white"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" /> Thử lại
                    </Button>
                  </div>
                </td>
              </tr>
            ) : tracks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-20 text-center text-muted-foreground"
                >
                  Chưa có bài hát nào trong Album này.
                </td>
              </tr>
            ) : (
              tracks.map((track: any) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  albumId={albumId}
                  onDelete={setTrackToDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!trackToDelete}
        onClose={() => setTrackToDelete(null)}
        onConfirm={executeDelete}
        title="Xóa bài hát"
        description={
          <>
            Bạn có chắc chắn muốn xóa bài hát{" "}
            <span className="text-white font-bold">
              "{trackToDelete?.title}"
            </span>{" "}
            không? Hành động này sẽ xóa cả file âm thanh và không thể hoàn tác.
          </>
        }
        confirmText="Xác nhận xóa"
        cancelText="Huỷ"
        isProcessing={deleteMutation.isPending}
      />
    </Fragment>
  );
}
