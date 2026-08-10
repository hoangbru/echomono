// components/features/layout/listener-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { Menu, ArrowLeft, Palette } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";

import ThemeSwitcher from "./theme-switcher";

interface ListenerHeaderProps {
  onOpenSidebar: () => void;
}

export function ListenerHeader({ onOpenSidebar }: ListenerHeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu theme khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        {/* BÊN TRÁI: Nút mở sidebar (mobile) + Nút Quay lại */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-accent/50 hover:bg-accent px-3 py-2 rounded-full transition-all border border-border/50"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
        </div>

        {/* BÊN PHẢI: Nút cài đặt/chọn Theme trực tiếp */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="flex items-center gap-2 bg-accent/50 hover:bg-accent border border-border/50 px-3.5 py-2 rounded-full text-xs font-semibold text-foreground transition-all shadow-sm"
            aria-label="Toggle theme settings"
          >
            <Palette className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline capitalize">Giao diện</span>
          </button>

          {isThemeMenuOpen && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-popover border border-border rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-xs font-bold text-muted-foreground uppercase px-2 mb-2">
                Tùy chỉnh Theme
              </p>
              <ThemeSwitcher />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
