"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Disc3, ArrowLeft, Music } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg space-y-8">
        <div className="relative flex items-center justify-center w-32 h-32">
          <Disc3
            className="absolute inset-0 w-full h-full text-primary/80 animate-[spin_10s_linear_infinite]"
            strokeWidth={1.5}
          />
          <div className="w-8 h-8 bg-background rounded-full border-4 border-primary z-10 shadow-inner" />
        </div>

        <div className="space-y-4">
          <h1 className="text-7xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary drop-shadow-sm">
            404
          </h1>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Nhịp điệu này đã bị đứt quãng!
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Giai điệu bạn đang tìm kiếm dường như không tồn tại, đã bị xóa
              hoặc bạn đang đi lạc vào một khu vực không được phép truy cập.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4">
          <Button
            onClick={() => router.back()}
            size="lg"
            className="w-full sm:w-auto gap-2 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang trước
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2 rounded-full border-border hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Link href="/">
              <Music className="w-4 h-4" />
              Quay về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
