import AlbumContainer from "@/components/features/listener/album/album-container";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AlbumContainer albumId={id} />;
}
