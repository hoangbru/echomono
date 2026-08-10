import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeading } from "@/components/ui/page-heading";
import { Button } from "@/components/ui/button";
import { AlbumGrid } from "@/components/features/studio/album";

export default async function StudioPage() {
  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <PageHeading>Album của tôi</PageHeading>
            <p className="text-muted-foreground text-[14px]">
              Quản lý album và trạng thái phát hành.
            </p>
          </div>
          <Link href="/studio/new">
            <Button className="bg-primary font-bold px-6 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
              <Plus className="w-4 h-4 mr-2" /> Tạo album mới
            </Button>
          </Link>
        </div>

        <AlbumGrid />
      </div>
    </div>
  );
}
