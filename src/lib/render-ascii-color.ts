/** 연속해서 같은 색인 문자를 묶어 원본 프레임의 RGB 색을 적용한다. */
export function renderAsciiColor(lines: string[], pixels: Uint8ClampedArray): DocumentFragment {
  const frame = document.createDocumentFragment();
  let pixelIndex = 0;

  for (const [row, line] of lines.entries()) {
    if (row > 0) frame.append("\n");

    let start = 0;
    while (start < line.length) {
      const first = pixelIndex + start * 4;
      const isSpace = line[start] === " ";
      const [red, green, blue] = [pixels[first], pixels[first + 1], pixels[first + 2]];
      let end = start + 1;

      while (end < line.length) {
        const next = pixelIndex + end * 4;
        const sameColor = line[end] !== " "
          && pixels[next] === red && pixels[next + 1] === green && pixels[next + 2] === blue;
        if (isSpace ? line[end] !== " " : !sameColor) break;
        end += 1;
      }

      const text = line.slice(start, end);
      if (isSpace) {
        frame.append(text);
      } else {
        const run = document.createElement("span");
        run.style.color = `rgb(${red}, ${green}, ${blue})`;
        run.textContent = text;
        frame.append(run);
      }
      start = end;
    }
    pixelIndex += line.length * 4;
  }

  return frame;
}
