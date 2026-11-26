import { randomBytes, randomUUID } from "node:crypto";
import { S3ServiceException } from "@aws-sdk/client-s3";
import { z } from "zod";
import { getAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { copyVerifiedUpload, discardVideoObject, getUploadedObject } from "@/lib/storage";

const completeUploadSchema = z.strictObject({ videoId: z.string().min(1).max(64) });

/** 검증이 끝난 영상의 공유 정보를 반환한다. */
function shareResponse(videoId: string, shareId: string) {
  return Response.json({ videoId, shareId }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    // 로그인 세션과 요청에 포함된 영상 ID를 확인한다.
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return Response.json({ error: "Sign in to complete the upload." }, { status: 401 });

    const parsed = completeUploadSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Invalid video ID." }, { status: 400 });

    const prisma = getPrisma();
    const owner = { id: parsed.data.videoId, ownerId: session.user.id, deletedAt: null };
    const video = await prisma.video.findFirst({ where: owner });
    if (!video) return Response.json({ error: "Video not found." }, { status: 404 });
    if (video.status === "READY" && video.shareId) return shareResponse(video.id, video.shareId);
    if (video.status !== "PENDING_UPLOAD") {
      return Response.json({ error: "This upload cannot be completed." }, { status: 409 });
    }

    // 중복 완료 요청에는 먼저 확정된 공유 ID를 돌려준다.
    async function resolveConflict() {
      const ready = await prisma.video.findFirst({
        where: { ...owner, status: "READY" },
        select: { shareId: true },
      });
      if (ready?.shareId) return shareResponse(owner.id, ready.shareId);
      return Response.json({ error: "The uploaded file is missing or has changed." }, { status: 409 });
    }

    // R2에 업로드된 객체의 크기가 DB에 등록한 크기와 같은지 확인한다.
    const object = await getUploadedObject(video.storageKey);
    if (!object?.ETag || object.ContentLength === undefined) return await resolveConflict();
    if (BigInt(object.ContentLength) !== video.sizeBytes) {
      return Response.json({ error: "The uploaded file size does not match." }, { status: 422 });
    }

    const storageKey = `videos/ready/${randomUUID()}`;
    try {
      // 기존 서명 URL로 공유 파일을 덮어쓸 수 없도록 별도의 키로 복사한다.
      await copyVerifiedUpload(video.storageKey, storageKey, object.ETag);
      const shareId = randomBytes(16).toString("base64url");
      const { count } = await prisma.video.updateMany({
        where: { ...owner, status: "PENDING_UPLOAD", storageKey: video.storageKey },
        data: { status: "READY", storageKey, shareId },
      });

      if (count === 0) {
        await discardVideoObject(storageKey);
        return await resolveConflict();
      }

      await discardVideoObject(video.storageKey);
      return shareResponse(video.id, shareId);
    } catch (error) {
      if (error instanceof S3ServiceException && [404, 412].includes(error.$metadata.httpStatusCode ?? 0)) {
        return await resolveConflict();
      }
      throw error;
    }
  } catch (error) {
    console.error("Could not complete video upload.", error);
    return Response.json({ error: "Could not complete the video upload." }, { status: 500 });
  }
}
