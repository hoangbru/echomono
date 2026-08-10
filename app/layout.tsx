import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";
import { QueryProvider, ThemeProvider } from "@/components/providers";
import { GlobalPlayer, QueuePanel } from "@/components/features/player";

import { ListenerWrapper } from "@/components/layout";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Echo - Music Streaming Platform",
  description:
    "Stream your favorite music with Echo. Discover artists, create playlists, and enjoy unlimited music.",
  generator: ".app",
  icons: {
    icon: "/ico/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.className} font-sans antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <Toaster />
            <QueuePanel />
            <GlobalPlayer />
            <ListenerWrapper>{children}</ListenerWrapper>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
