import { FormAlbumEdit } from "@/components/features/studio/album/form-album-edit";
import { PageHeading } from "@/components/ui/page-heading";

export default async function EditAlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const resolvedParams = await params;
  const albumId = resolvedParams.albumId;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 md:p-8">
        <PageHeading>Chỉnh sửa thông tin Album</PageHeading>
        <FormAlbumEdit albumId={albumId} />
      </div>
    </div>
  );
}
