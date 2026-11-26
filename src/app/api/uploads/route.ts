import { randomUUID } from "node:crypto";
import { getAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createUploadUrl } from "@/lib/storage";
import { getVideoContentType, MAX_SINGLE_UPLOAD_BYTES, uploadRequestSchema } from "@/lib/video-upload";

/** 클라이언트에서 파일 이름, 크기, MIME 타입, ASCII 설정을 POST로 받는다. */
export async function POST(request: Request) {
  try {
    // Better Auth 세션에서 로그인한 사용자 정보를 확인한다.
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return Response.json({ error: "Sign in to upload a video." }, { status: 401 });

    // 요청 JSON을 읽고 Zod로 파일 정보와 ASCII 설정을 검증한다.
    const body = await request.json().catch(() => null);
    const input = uploadRequestSchema.safeParse(body);
    if (!input.success) {
      return Response.json({ error: "Invalid video details or export settings." }, { status: 400 });
    }

    // 파일의 MIME 타입과 최대 업로드 크기를 확인한다.
    const { fileName, sizeBytes, settings } = input.data;
    const contentType = getVideoContentType(fileName, input.data.contentType);
    if (!contentType) {
      return Response.json({ error: "Choose a video file to upload." }, { status: 400 });
    }
    if (sizeBytes > MAX_SINGLE_UPLOAD_BYTES) {
      return Response.json({ error: "This video exceeds the upload size limit." }, { status: 413 });
    }

    // R2 객체 키를 만들고 직접 업로드할 수 있는 서명 URL을 발급한다.
    // 서명에 실패하면 DB에 대기 중인 영상이 남지 않도록 URL부터 생성한다.
    const storageKey = `videos/${randomUUID()}`;
    const upload = await createUploadUrl(storageKey, contentType, sizeBytes);

    // Prisma로 PostgreSQL에 업로드 대기 상태의 영상 정보를 저장한다.
    const video = await getPrisma().video.create({
      data: {
        ownerId: session.user.id,
        title: fileName,
        storageKey,
        settings,
        sizeBytes: BigInt(sizeBytes),
      },
      select: { id: true },
    });

    // 영상 ID, 업로드 URL, 업로드에 필요한 헤더를 클라이언트에 반환한다.
    return Response.json(
      { videoId: video.id, uploadUrl: upload.url, headers: upload.headers },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Could not prepare video upload.", error);
    return Response.json({ error: "Could not prepare the video upload." }, { status: 500 });
  }
}
