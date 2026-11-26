import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth/minimal";
import { getPrisma } from "./prisma";

let auth: ReturnType<typeof createAuth> | undefined;

/** 인증 요청을 처음 처리할 때 클라이언트를 만들고 이후 요청에서 재사용한다. */
export function getAuth() {
  return auth ??= createAuth();
}

/** Google 설정의 짝을 확인한 뒤 인증에 필요한 Prisma 연결을 구성한다. */
function createAuth() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
    throw new Error("Google OAuth requires both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
    socialProviders: googleClientId && googleClientSecret
      ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
      : {},
  });
}
