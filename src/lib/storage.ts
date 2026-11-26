import "server-only";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_URL_TTL_SECONDS = 15 * 60;
let storage: { client: S3Client; bucket: string; endpointPath: string } | undefined;

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

  const endpointPath = new URL(endpoint).pathname.replace(/\/$/, "");
  storage = { client, bucket, endpointPath };
  return storage;
}

/** 브라우저에서 지정된 키, 형식, 파일 크기로 직접 PUT할 수 있게 서명한다. */
export async function createUploadUrl(storageKey: string, contentType: string, sizeBytes: number) {
  const { client, bucket } = getStorage();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    ContentType: contentType,
    ContentLength: sizeBytes,
  });
  const url = await getSignedUrl(client, command, {
    expiresIn: UPLOAD_URL_TTL_SECONDS,
    signableHeaders: new Set(["content-type", "content-length"]),
  });

  return { url, headers: { "Content-Type": contentType } };
}

/** 업로드된 객체의 크기와 복사에 사용할 ETag를 확인한다. */
export async function getUploadedObject(storageKey: string) {
  const { client, bucket } = getStorage();
  try {
    return await client.send(new HeadObjectCommand({ Bucket: bucket, Key: storageKey }));
  } catch (error) {
    if (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404) {
      return null;
    }
    throw error;
  }
}

/** 검증한 객체만 서버가 관리하는 최종 키로 복사한다. */
export async function copyVerifiedUpload(
  sourceKey: string,
  destinationKey: string,
  etag: string,
) {
  const { client, bucket, endpointPath } = getStorage();
  // 기존 PUT과 GET에 적용되는 엔드포인트 경로를 복사 원본의 키에도 포함한다.
  const encodedKey = sourceKey.split("/").map(encodeURIComponent).join("/");
  await client.send(new CopyObjectCommand({
    Bucket: bucket,
    Key: destinationKey,
    CopySource: `${encodeURIComponent(bucket)}${endpointPath}/${encodedKey}`,
    CopySourceIfMatch: etag,
  }));
}

/** 정리 실패가 이미 끝난 공유 작업의 응답을 바꾸지 않도록 기록한다. */
export async function discardVideoObject(storageKey: string) {
  try {
    const { client, bucket } = getStorage();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: storageKey }));
  } catch (error) {
    console.error("Could not clean up the video object.", error);
  }
}
