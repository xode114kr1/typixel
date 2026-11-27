import { getAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { videoSettingsSchema } from "@/lib/video-upload";

export async function PATCH(request: Request, { params }: { params: Promise<{ videoId: string }> }) {
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return Response.json({ error: "Sign in to edit the video." }, { status: 401 });

    const settings = videoSettingsSchema.safeParse(await request.json().catch(() => null));
    if (!settings.success) return Response.json({ error: "Invalid video settings." }, { status: 400 });

    // 소유권과 영상 상태를 확인하는 조건을 갱신 쿼리에 함께 적용한다.
    const { videoId } = await params;
    const { count } = await getPrisma().video.updateMany({
      where: {
        id: videoId,
        ownerId: session.user.id,
        status: "READY",
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      data: { settings: settings.data },
    });

    if (count === 0) return Response.json({ error: "Video not found." }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Could not update the video settings.", error);
    return Response.json({ error: "Could not update the video settings." }, { status: 500 });
  }
}
