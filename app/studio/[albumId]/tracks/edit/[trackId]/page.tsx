import { FormTrackEdit } from "@/components/features/studio/track/form-track-edit";
import { PageHeading } from "@/components/ui/page-heading";

export default async function EditTrackPage({
  params,
}: {
  params: Promise<{ albumId: string; trackId: string }>;
}) {
  const resolvedParams = await params;
  const { albumId, trackId } = resolvedParams;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 md:p-8">
        <PageHeading>Chỉnh sửa bài hát</PageHeading>
        <FormTrackEdit albumId={albumId} trackId={trackId} />
      </div>
    </div>
  );
}
