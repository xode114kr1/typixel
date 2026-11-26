import { z } from "zod";
import { ASCII_CHARACTER_SETS, ASCII_TONE_LIMITS } from "@/lib/ascii";
import { MAX_ASCII_COLUMNS, MIN_ASCII_COLUMNS } from "@/lib/capture-ascii-frame";
import { MAX_OUTPUT_VOLUME } from "@/lib/video-volume";

const { brightness, contrast, gamma, threshold } = ASCII_TONE_LIMITS;

// R2는 한 번의 PUT으로 5 GiB에서 5 MiB를 뺀 크기까지 받는다.
export const MAX_SINGLE_UPLOAD_BYTES = (5 * 1024 - 5) * 1024 ** 2;

export const uploadRequestSchema = z.strictObject({
  fileName: z.string().trim().min(1).max(255).regex(/^[^/\\\p{Cc}]+$/u),
  contentType: z.string().trim().toLowerCase().max(127),
  sizeBytes: z.int().positive(),
  settings: z.strictObject({
    columns: z.int().min(MIN_ASCII_COLUMNS).max(MAX_ASCII_COLUMNS),
    tone: z.strictObject({
      brightness: z.int().min(brightness.min).max(brightness.max),
      contrast: z.int().min(contrast.min).max(contrast.max),
      gamma: z.number().min(gamma.min).max(gamma.max),
      threshold: z.int().min(threshold.min).max(threshold.max),
    }),
    appearance: z.strictObject({
      characterSet: z.enum(Object.keys(ASCII_CHARACTER_SETS)),
      mode: z.enum(["monochrome", "color"]),
      backgroundColor: z.string().regex(/^#[\da-f]{6}$/i),
    }),
    outputVolume: z.int().min(0).max(MAX_OUTPUT_VOLUME),
  }),
});

/** 브라우저가 파일 형식을 제공하지 않으면 파일 선택 UI가 지원하는 확장자를 사용한다. */
export function getVideoContentType(fileName: string, contentType: string) {
  if (contentType) return /^video\/[a-z0-9][a-z0-9.+_-]*$/.test(contentType) ? contentType : null;

  const extension = fileName.match(/\.(mp4|webm|mov)$/i)?.[1].toLowerCase();
  if (extension === "mp4") return "video/mp4";
  if (extension === "webm") return "video/webm";
  if (extension === "mov") return "video/quicktime";
  return null;
}
