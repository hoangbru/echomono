import { FormAlbumAdd } from "@/components/features/studio/album";
import { PageHeading } from "@/components/ui/page-heading";

export default async function NewAlbumPage() {
  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 md:p-8">
        <PageHeading>Phát hành album</PageHeading>
        <FormAlbumAdd />
      </div>
    </div>
  );
}
