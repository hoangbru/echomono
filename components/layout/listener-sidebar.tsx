// components/layouts/listener-sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, Home, Compass, Download, Library } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";

const mainMenu = [
  { label: "Trang chủ", icon: Home, href: "/" },
  { label: "Studio", icon: Compass, href: "/studio" },
];

const libraryMenu = [
  { label: "Nhạc đã tải", icon: Download, href: "/library/downloads" },
];

interface ListenerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function ListenerSidebar({
  isOpen,
  onClose,
  isMobile = false,
}: ListenerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-sidebar border-border flex flex-col flex-shrink-0 z-50",
        isMobile
          ? "fixed inset-y-0 left-0 w-64 border-r transition-transform duration-300 lg:hidden"
          : "w-full lg:w-64 border-r h-full lg:h-screen lg:sticky lg:top-0 overflow-y-auto",
        isMobile && (isOpen ? "translate-x-0" : "-translate-x-full"),
      )}
    >
      <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Image
              src="/echo.png"
              alt="echo-logo"
              width={20}
              height={20}
              className="w-full object-cover drop-shadow-md"
            />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground">
            Echo
          </span>
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-6">
          {/* MENU CHÍNH */}
          <div className="space-y-2">
            <p className="px-4 text-xs font-bold tracking-widest text-muted-foreground uppercase mb-3">
              Khám phá
            </p>
            {mainMenu.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              // Sửa lỗi active cho trang chủ ("/") không bị dính vào các trang khác
              const isStrictActive =
                item.href === "/" ? pathname === "/" : isActive;

              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 transition-all duration-300 rounded-xl",
                      isStrictActive
                        ? "text-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.05)] font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent font-medium",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isStrictActive ? "fill-primary/20" : "",
                      )}
                    />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* THƯ VIỆN */}
          <div className="space-y-2">
            <p className="px-4 text-xs font-bold tracking-widest text-muted-foreground uppercase mb-3">
              Thư viện của bạn
            </p>
            {libraryMenu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 transition-all duration-300 rounded-xl",
                      isActive
                        ? "text-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.05)] font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent font-medium",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isActive ? "fill-primary/20" : "",
                      )}
                    />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
