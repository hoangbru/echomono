import { TrackGrid } from "@/components/features/studio/track";

export default async function AlbumTracksPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 md:p-8">
        <TrackGrid albumId={albumId} />
      </div>
    </div>
  );
}
