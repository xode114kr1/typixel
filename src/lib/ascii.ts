export const ASCII_CHARACTER_SETS = {
  standard: " .:-=+*#%@",
  minimal: " .:*#",
  binary: " 01",
} as const;

export type AsciiCharacterSet = keyof typeof ASCII_CHARACTER_SETS;

export type AsciiAppearance = {
  characterSet: AsciiCharacterSet;
  mode: "monochrome" | "color";
  backgroundColor: string;
};

export const DEFAULT_ASCII_APPEARANCE: AsciiAppearance = {
  characterSet: "standard",
  mode: "monochrome",
  backgroundColor: "#000000",
};

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

export const ASCII_TONE_LIMITS = {
  brightness: { min: 0, max: 200 },
  contrast: { min: 0, max: 200 },
  gamma: { min: 0.1, max: 3 },
  threshold: { min: 0, max: 100 },
} as const;

/** 0~255 범위의 RGB 값 세 개를 밝기에 대응하는 ASCII 문자로 변환한다. */
export function rgbToAscii(
  red: number,
  green: number,
  blue: number,
  tone = DEFAULT_ASCII_TONE,
  characters: string = ASCII_CHARACTER_SETS.standard,
): string {
  // 사람이 느끼는 밝기에 맞춰 색상 채널마다 다른 가중치를 적용한다.
  const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
  const lastIndex = characters.length - 1;
  const adjustedBrightness = Math.min(255, brightness * (tone.brightness / 100));
  // 중간 밝기를 기준으로 밝고 어두운 쪽의 차이를 확대하거나 줄인다.
  const midpoint = 255 / 2;
  const contrasted = midpoint + (adjustedBrightness - midpoint) * (tone.contrast / 100);
  const clamped = Math.max(0, Math.min(255, contrasted));
  // 감마로 중간 밝기를 보정한 후, 임계값보다 어두운 픽셀은 공백으로 처리한다.
  const corrected = (clamped / 255) ** (1 / tone.gamma);
  if (corrected < tone.threshold / 100) return " ";

  const index = Math.round(corrected * lastIndex);

  return characters.charAt(index);
}
