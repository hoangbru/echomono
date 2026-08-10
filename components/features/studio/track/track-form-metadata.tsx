// app/studio/[albumId]/tracks/new/track-form-metadata.tsx
"use client";

import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import { Search } from "lucide-react";
import { SubmitButton } from "@/components/shared/buttons";
import { Button } from "@/components/ui/button";

interface TrackFormMetadataProps {
  form: UseFormReturn<any>;
  status: string;
  isEditMode?: boolean; // Prop mới để biết đang ở trang Edit hay Add
  // Các props dành cho trang Add (có thể optional ở trang Edit)
  onSearch?: () => void;
  isSearching?: boolean;
  searchResults?: any[];
  selectedTrack?: any;
  setSelectedTrack?: (track: any) => void;
  isManual?: boolean;
  setIsManual?: (val: boolean) => void;
}

export function TrackFormMetadata({
  form,
  status,
  isEditMode = false,
  onSearch,
  isSearching,
  searchResults,
  selectedTrack,
  setSelectedTrack,
  isManual = true, // Mặc định ở trang Edit thì là Manual
  setIsManual,
}: TrackFormMetadataProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="col-span-1 md:col-span-2 space-y-6 bg-card p-6 rounded-2xl border border-border">
      {/* KHUNG THÔNG TIN BÀI HÁT */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-4">
        {/* Chỉ hiện Header đổi chế độ khi ở trang THÊM MỚI */}
        {!isEditMode && setIsManual && (
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-primary uppercase">
              {isManual
                ? "Nhập thông tin bài hát thủ công"
                : "Tìm dữ liệu iTunes"}
            </label>
            <button
              type="button"
              onClick={() => setIsManual(!isManual)}
              className="text-xs font-bold text-muted-foreground hover:text-primary underline transition-colors"
            >
              {isManual ? "Tìm kiếm bằng iTunes" : "Nhập thủ công"}
            </button>
          </div>
        )}

        {/* KHU VỰC NHẬP TÊN BÀI VÀ NGHỆ SĨ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              {...register("trackName")}
              placeholder="Tên bài hát *"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary outline-none"
            />
            {errors.trackName && (
              <p className="text-destructive text-xs mt-1">
                {errors.trackName.message as string}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              {...register("artistName")}
              placeholder="Tên nghệ sĩ"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary outline-none"
            />

            {/* Nếu đang ở chế độ tìm iTunes của Form Add thì hiện nút Tìm kiếm */}
            {!isEditMode && !isManual && onSearch && (
              <Button
                type="button"
                onClick={onSearch}
                disabled={isSearching}
                className="h-11 px-4 bg-primary text-white"
              >
                <Search className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* KHU VỰC HIỂN THỊ KẾT QUẢ ITUNES (Chỉ trang Add mới có) */}
        {!isEditMode && !isManual && searchResults && setSelectedTrack && (
          <div className="pt-2">
            {isSearching ? (
              <p className="text-xs text-muted-foreground">Đang tìm kiếm...</p>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {searchResults.map((t) => (
                  <div
                    key={t.itunes_id}
                    onClick={() => setSelectedTrack(t)}
                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${
                      selectedTrack?.itunes_id === t.itunes_id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className="relative w-10 h-10 shrink-0 rounded bg-muted overflow-hidden">
                      <Image
                        src={t.cover_url}
                        alt="cover"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{t.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {t.artist_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* SỐ THỨ TỰ BÀI */}
      <div className="w-full md:w-1/2">
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Bài số (Track Number) *
        </label>
        <input
          type="number"
          min={1}
          {...register("trackNumber", { valueAsNumber: true, required: true })}
          className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:ring-2 outline-none"
        />
      </div>

      {/* KHUNG NHẬP LỜI BÀI HÁT (Chỉ hiện khi ở chế độ Edit) */}
      {isEditMode && (
        <div className="w-full pt-2">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase">
              Lời bài hát
            </label>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
              Hỗ trợ Plain Text & LRC
            </span>
          </div>
          <textarea
            {...register("lyrics")}
            placeholder="[00:15.30] Nhập lời bài hát có kèm thời gian...&#10;Hoặc nhập văn bản thường..."
            className="flex min-h-[300px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:ring-2 focus-visible:ring-primary outline-none font-mono resize-y custom-scrollbar leading-relaxed"
          />
          <p className="text-[11px] text-muted-foreground mt-2">
            * Đối với định dạng LRC, hãy đảm bảo mỗi dòng có chứa thẻ thời gian
            ví dụ:{" "}
            <code className="text-primary bg-primary/10 px-1 rounded">
              [00:12.34]
            </code>
            .
          </p>
        </div>
      )}

      {/* NÚT SUBMIT */}
      <div className="flex pt-4">
        <SubmitButton
          isSubmitting={status === "submitting"}
          defaultText={
            isEditMode
              ? "Lưu thay đổi"
              : isManual
                ? "Lưu thủ công & Đồng bộ Lyrics"
                : "Lưu bài hát đã chọn"
          }
          loadingText={
            isEditMode ? "Đang cập nhật..." : "Đang lưu & trích xuất LRC..."
          }
          className="w-full sm:w-auto sm:px-8"
        />
      </div>
    </div>
  );
}
