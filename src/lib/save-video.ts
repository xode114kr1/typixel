import type { VideoSettings } from "./video-upload";

/** 앱 API가 실패하면 서버에서 돌려준 안내를 사용한다. */
async function postJson<T>(path: string, body: object, fallbackMessage: string): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(typeof result?.error === "string" ? result.error : fallbackMessage);
  }

  return response.json();
}

/** 업로드 권한을 받은 뒤 원본을 R2로 보내고 저장을 완료한다. */
export async function saveVideo(file: File, settings: VideoSettings) {
  const { videoId, uploadUrl, headers } = await postJson<{
    videoId: string;
    uploadUrl: string;
    headers: Record<string, string>;
  }>("/api/uploads", {
    fileName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
    settings,
  }, "Could not prepare the video upload.");

  const upload = await fetch(uploadUrl, { method: "PUT", headers, body: file });
  if (!upload.ok) throw new Error("Could not upload the video file.");

  return postJson<{ videoId: string; shareId: string }>("/api/videos", { videoId }, "Could not complete the video upload.");
}
