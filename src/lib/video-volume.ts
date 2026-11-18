export const MAX_OUTPUT_VOLUME = 100;
export const MAX_PREVIEW_VOLUME = 10;

/** 두 슬라이더 값을 원본 볼륨 1에 곱할 수 있는 배율로 변환한다. */
export function getPreviewGain(outputVolume: number, previewVolume: number): number {
  return (outputVolume / MAX_OUTPUT_VOLUME) * (previewVolume / MAX_PREVIEW_VOLUME);
}
