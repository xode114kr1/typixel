import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createPlaybackUrl } from "@/lib/storage";
import { videoSettingsSchema } from "@/lib/video-upload";
import { SavedVideoEditor } from "./saved-video-editor";

type EditVideoPageProps = { params: Promise<{ videoId: string }> };

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  const { videoId } = await params;

  // 로그인과 영상 소유권을 확인한 뒤에만 원본 재생 URL을 발급한다.
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) notFound();

  const video = await getPrisma().video.findFirst({
    where: { id: videoId, ownerId: session.user.id, status: "READY", deletedAt: null },
    select: { title: true, settings: true, storageKey: true, expiresAt: true },
  });
  if (!video) notFound();

  const settings = videoSettingsSchema.safeParse(video.settings);
  if (!settings.success) throw new Error("The saved settings could not be loaded.");

  const source = await createPlaybackUrl(video.storageKey, video.expiresAt);
  if (!source) notFound();
  return <SavedVideoEditor key={videoId} title={video.title} source={source} savedSettings={settings.data} />;
}
