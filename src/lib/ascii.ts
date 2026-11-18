const ASCII_CHARACTERS = " .:-=+*#%@";

/** 0~255 범위의 RGB 값 세 개를 밝기에 대응하는 ASCII 문자로 변환한다. */
export function rgbToAscii(red: number, green: number, blue: number): string {
  // 사람이 느끼는 밝기에 맞춰 색상 채널마다 다른 가중치를 적용한다.
  const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
  const lastIndex = ASCII_CHARACTERS.length - 1;
  const index = Math.round((brightness / 255) * lastIndex);

  return ASCII_CHARACTERS.charAt(index);
}
