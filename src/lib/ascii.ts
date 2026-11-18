const ASCII_CHARACTERS = " .:-=+*#%@";

export type AsciiTone = {
  brightness: number;
  contrast: number;
  gamma: number;
  threshold: number;
};

export const DEFAULT_ASCII_TONE: AsciiTone = {
  brightness: 100,
  contrast: 100,
  gamma: 1,
  threshold: 0,
};

/** 0~255 범위의 RGB 값 세 개를 밝기에 대응하는 ASCII 문자로 변환한다. */
export function rgbToAscii(
  red: number,
  green: number,
  blue: number,
  tone = DEFAULT_ASCII_TONE,
): string {
  // 사람이 느끼는 밝기에 맞춰 색상 채널마다 다른 가중치를 적용한다.
  const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
  const lastIndex = ASCII_CHARACTERS.length - 1;
  const adjustedBrightness = Math.min(255, brightness * (tone.brightness / 100));
  // 중간 밝기를 기준으로 밝고 어두운 쪽의 차이를 확대하거나 줄인다.
  const midpoint = 255 / 2;
  const contrasted = midpoint + (adjustedBrightness - midpoint) * (tone.contrast / 100);
  const clamped = Math.max(0, Math.min(255, contrasted));
  // 감마로 중간 밝기를 보정한 후, 임계값보다 어두운 픽셀은 공백으로 처리한다.
  const corrected = (clamped / 255) ** (1 / tone.gamma);
  if (corrected < tone.threshold / 100) return " ";

  const index = Math.round(corrected * lastIndex);

  return ASCII_CHARACTERS.charAt(index);
}
