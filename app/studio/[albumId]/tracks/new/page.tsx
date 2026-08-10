import { FormTrackAdd } from "@/components/features/studio/track";
import { PageHeading } from "@/components/ui/page-heading";

export default async function NewTrackPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId: albumId } = await params;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 md:p-8">
        <PageHeading>Thêm bài hát mới</PageHeading>
        <FormTrackAdd albumId={albumId} />
      </div>
    </div>
  );
}
