"use client";

import { UseFormReturn } from "react-hook-form";
import { Search, PenLine, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/shared/buttons";
import { AlbumNewFormValues } from "./form-album-add";

interface AlbumFormMetadataProps {
  form: UseFormReturn<AlbumNewFormValues>;
  status: string;
  onSearch: () => void;
  isManual: boolean;
  setIsManual: (val: boolean) => void;
}

export function AlbumFormMetadata({
  form,
  status,
  onSearch,
  isManual,
  setIsManual,
}: AlbumFormMetadataProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="col-span-1 md:col-span-2 space-y-6 bg-card p-6 rounded-2xl border border-border">
      {/* CÔNG TẮC CHUYỂN ĐỔI CHẾ ĐỘ */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-lg font-bold">Nguồn dữ liệu</h2>
        <div className="flex items-center bg-secondary p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setIsManual(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              !isManual
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4" /> iTunes
          </button>
          <button
            type="button"
            onClick={() => setIsManual(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isManual
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PenLine className="w-4 h-4" /> Nhập tay
          </button>
        </div>
      </div>

      {isManual ? (
        // ================= GIAO DIỆN NHẬP THỦ CÔNG =================
        <div className="bg-secondary/20 border border-border p-4 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-2">
                Tên Album *
              </label>
              <input
                type="text"
                {...register("albumName", { required: isManual })}
                placeholder="VD: Đánh Đổi"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2">
                Tên Nghệ Sĩ *
              </label>
              <input
                type="text"
                {...register("artistName", { required: isManual })}
                placeholder="VD: Obito"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-2">
                Ngày phát hành
              </label>
              <input
                type="date"
                {...register("releaseDate")}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2">
                Tổng số bài hát
              </label>
              <input
                type="number"
                min="1"
                {...register("totalTracks")}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-2">
              Link Ảnh Bìa (URL)
            </label>
            <input
              type="text"
              {...register("coverUrl")}
              placeholder="https://example.com/cover.jpg"
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
            />
          </div>
        </div>
      ) : (
        // ================= GIAO DIỆN TÌM KIẾM ITUNES CŨ =================
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary uppercase mb-2">
              Tên Nghệ sĩ (Hoặc Tên Album) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                {...register("artistName")}
                placeholder="VD: Obito, Sơn Tùng M-TP..."
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              />
              <Button
                type="button"
                onClick={onSearch}
                className="h-12 px-5 bg-primary hover:bg-accent font-bold shrink-0 text-white"
              >
                <Search className="w-4 h-4 mr-2" /> Tìm trên iTunes
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              <i>Mẹo:</i> Bạn có thể chỉ cần gõ tên nghệ sĩ để hệ thống quét
              toàn bộ danh sách album.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase mb-2">
              Tên Album cụ thể (Tùy chọn)
            </label>
            <input
              type="text"
              {...register("albumName")}
              placeholder="VD: Đánh Đổi..."
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
            />
          </div>
        </div>
      )}

      {/* NÚT SUBMIT */}
      <div className="flex pt-4">
        <SubmitButton
          isSubmitting={status === "submitting"}
          defaultText={isManual ? "Tạo Album Thủ Công" : "Lưu Album & Đồng bộ"}
          loadingText="Đang xử lý..."
          className="w-full sm:w-auto sm:px-8"
        />
      </div>
    </div>
  );
}
