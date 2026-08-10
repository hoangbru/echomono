"use client";

import { UseFormReturn } from "react-hook-form";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/shared/buttons";
import { AlbumNewFormValues } from "./form-album-add";

interface AlbumFormMetadataProps {
  form: UseFormReturn<AlbumNewFormValues>;
  status: string;
  onSearch: () => void;
}

export function AlbumFormMetadata({
  form,
  status,
  onSearch,
}: AlbumFormMetadataProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="col-span-1 md:col-span-2 space-y-6 bg-card p-6 rounded-2xl border border-border">
      {/* KHUNG TÌM KIẾM THÔNG MINH (Hỗ trợ tìm theo Nghệ sĩ hoặc Album) */}
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
              <Search className="w-4 h-4 mr-2" /> Tìm kiếm trên iTunes
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            <i>Mẹo:</i> Bạn có thể chỉ cần gõ tên nghệ sĩ (ví dụ: Obito) để hệ
            thống quét toàn bộ danh sách album.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary uppercase mb-2">
            Tên Album cụ thể (Tùy chọn - Giúp lọc chính xác hơn)
          </label>
          <input
            type="text"
            {...register("albumName")}
            placeholder="VD: Đánh Đổi..."
            className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* NÚT SUBMIT */}
      <div className="flex pt-4">
        <SubmitButton
          isSubmitting={status === "submitting"}
          defaultText="Lưu Album & Đồng bộ"
          loadingText="Đang xử lý..."
          className="w-full sm:w-auto sm:px-8"
        />
      </div>
    </div>
  );
}
