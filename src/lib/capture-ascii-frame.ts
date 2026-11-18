import { rgbToAscii } from "./ascii";

export const DEFAULT_ASCII_COLUMNS = 64;
export const DEFAULT_ASCII_BRIGHTNESS = 100;
const MAX_ROWS = 160;

/** 현재 영상 프레임을 축소해 픽셀 하나를 문자 하나로 변환한다. */
export function captureAsciiFrame(
  video: HTMLVideoElement,
  characterAspectRatio: number,
  context: CanvasRenderingContext2D,
  targetColumns: number,
  brightness: number,
): string {
  // 문자의 폭과 줄 높이가 다르므로 실제 표시 비율에 맞춰 행 수를 보정한다.
  const rowsPerColumn = (video.videoHeight / video.videoWidth) * characterAspectRatio;
  const columns = Math.max(1, Math.min(targetColumns, Math.floor(MAX_ROWS / rowsPerColumn)));
  const rows = Math.max(1, Math.min(MAX_ROWS, Math.round(columns * rowsPerColumn)));

  const { canvas } = context;
  if (canvas.width !== columns) canvas.width = columns;
  if (canvas.height !== rows) canvas.height = rows;

  context.drawImage(video, 0, 0, columns, rows);
  const { data } = context.getImageData(0, 0, columns, rows);
  const lines: string[] = [];
  const brightnessMultiplier = brightness / 100;

  for (let row = 0; row < rows; row += 1) {
    let line = "";
    for (let column = 0; column < columns; column += 1) {
      const index = (row * columns + column) * 4;
      line += rgbToAscii(data[index], data[index + 1], data[index + 2], brightnessMultiplier);
    }
    lines.push(line);
  }

  return lines.join("\n");
}
