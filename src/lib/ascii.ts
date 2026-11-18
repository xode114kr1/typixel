const ASCII_CHARACTERS = " .:-=+*#%@";

/** 0~255 범위의 RGB 값 세 개를 밝기에 대응하는 ASCII 문자로 변환한다. */
export function rgbToAscii(
  red: number,
  green: number,
  blue: number,
  brightnessMultiplier = 1,
  contrastMultiplier = 1,
): string {
  // 사람이 느끼는 밝기에 맞춰 색상 채널마다 다른 가중치를 적용한다.
  const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
  const lastIndex = ASCII_CHARACTERS.length - 1;
  const adjustedBrightness = Math.min(255, brightness * brightnessMultiplier);
  // 중간 밝기를 기준으로 밝고 어두운 쪽의 차이를 확대하거나 줄인다.
  const midpoint = 255 / 2;
  const contrasted = midpoint + (adjustedBrightness - midpoint) * contrastMultiplier;
  const clamped = Math.max(0, Math.min(255, contrasted));
  const index = Math.round((clamped / 255) * lastIndex);

  return ASCII_CHARACTERS.charAt(index);
}
