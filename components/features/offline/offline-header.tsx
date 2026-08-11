import { ArrowDownCircle, WifiOff } from "lucide-react";

interface OfflineHeaderProps {
  trackCount: number;
  albumCount: number;
}

export function OfflineHeader({ trackCount, albumCount }: OfflineHeaderProps) {
  return (
    <div className="flex items-end gap-6 mb-8 mt-4">
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gradient-to-br from-green-500 to-green-900 flex items-center justify-center shadow-2xl shrink-0">
        <ArrowDownCircle className="w-16 h-16 md:w-20 md:h-20 text-white" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <WifiOff className="w-4 h-4" /> Ngoại tuyến
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">
          Nhạc Đã Tải
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          {trackCount} bài hát • {albumCount} Album
        </p>
      </div>
    </div>
  );
}

export function OfflineEmptyState() {
  return (
    <div className="text-center py-20 bg-card/30 rounded-2xl border border-border mt-8">
      <ArrowDownCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-bold">Thư viện trống</h3>
      <p className="text-muted-foreground text-sm mt-2">
        Tìm và tải xuống các bài hát hoặc album để nghe khi không có mạng.
      </p>
    </div>
  );
}
