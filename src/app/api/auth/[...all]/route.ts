import { toNextJsHandler } from "better-auth/next-js";

// 배포 빌드에서는 DB 접속 정보를 요구하지 않도록 첫 인증 요청에서 설정을 불러온다.
export const { GET, POST } = toNextJsHandler(async (request) => {
  const { auth } = await import("@/lib/auth");
  return auth.handler(request);
});
