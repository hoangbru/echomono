"use client";

import { ReactNode, useState } from "react";

import { ListenerSidebar } from "@/components/layout/listener-sidebar";
import { ListenerHeader } from "@/components/layout/listener-header";
import { MobileOverlay } from "@/components/layout";

import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/utils/helpers";

export function ListenerWrapper({ children }: { children: ReactNode }) {
  const { isQueueVisible } = usePlayer();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex h-screen bg-background flex-col lg:flex-row overflow-hidden">
        {/* SIDEBAR DESKTOP */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <ListenerSidebar />
        </div>

        {/* SIDEBAR MOBILE */}
        <ListenerSidebar
          isMobile
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 h-full transition-all duration-300 ease-in-out",
            isQueueVisible ? "xl:mr-[350px]" : "mr-0",
          )}
        >
          <ListenerHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto pb-32">
            <div className="min-h-screen bg-background">{children}</div>
          </main>
        </div>
      </div>

      <MobileOverlay
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
