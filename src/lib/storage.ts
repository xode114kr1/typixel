import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_URL_TTL_SECONDS = 15 * 60;
let storage: { client: S3Client; bucket: string } | undefined;

/** 업로드 URL을 처음 요청할 때만 서버의 R2 설정을 읽는다. */
function getStorage() {
  if (storage) return storage;

  const {
    R2_ENDPOINT: endpoint,
    R2_BUCKET_NAME: bucket,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
  } = process.env;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 requires R2_ENDPOINT, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.",
    );
  }

  const client = new S3Client({
    endpoint,
    region: "auto",
    credentials: { accessKeyId, secretAccessKey },
    // 브라우저가 나중에 본문을 보내므로 서명 시 빈 본문의 체크섬이 생기지 않게 한다.
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

  storage = { client, bucket };
  return storage;
}

/** 브라우저가 지정된 키와 Content-Type으로 직접 PUT할 수 있는 URL을 발급한다. */
export async function createUploadUrl(storageKey: string, contentType: string) {
  const { client, bucket } = getStorage();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    ContentType: contentType,
  });
  const url = await getSignedUrl(client, command, {
    expiresIn: UPLOAD_URL_TTL_SECONDS,
    signableHeaders: new Set(["content-type"]),
  });

  return { url, headers: { "Content-Type": contentType } };
}
