import { captureAsciiFrame, DEFAULT_ASCII_COLUMNS } from "./capture-ascii-frame";

/** 영상의 재생 상태에 맞춰 ASCII 출력을 갱신하고 정리 함수를 반환한다. */
export function startAsciiPlayback(
  video: HTMLVideoElement,
  output: HTMLPreElement,
  characterSample: HTMLElement,
  onError: (message: string) => void,
) {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) {
    onError("Canvas 2D is unavailable in this browser.");
    return null;
  }

  const usesVideoFrames = typeof video.requestVideoFrameCallback === "function";
  let pendingFrame: number | null = null;
  let lastTime = -1;
  let characterAspectRatio = 0;
  let captureFailed = false;
  let columns = DEFAULT_ASCII_COLUMNS;

  // React를 다시 렌더링하지 않고 미리보기의 텍스트만 갱신한다.
  const renderFrame = () => {
    if (video.seeking || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (!video.videoWidth || !characterAspectRatio) return;

    try {
      const frame = captureAsciiFrame(video, characterAspectRatio, context, columns);
      if (output.textContent !== frame) output.textContent = frame;
      lastTime = video.currentTime;
      if (captureFailed) onError("");
      captureFailed = false;
    } catch {
      if (!captureFailed) onError("This frame could not be converted to ASCII.");
      captureFailed = true;
    }
  };

  // 글자 크기는 레이아웃이 바뀔 때만 다시 측정한다.
  function measureCharacter() {
    const { width, height } = characterSample.getBoundingClientRect();
    characterAspectRatio = height ? width / height : 0;
    renderFrame();
  }

  // 재생 중에만 다음 프레임을 예약하고, 지원하지 않는 브라우저에서는 화면 갱신 주기를 사용한다.
  function scheduleFrame() {
    if (pendingFrame !== null || video.paused || video.ended || video.seeking) return;

    pendingFrame = usesVideoFrames
      ? video.requestVideoFrameCallback(frameReady)
      : requestAnimationFrame(frameReady);
  }

  // 대체 경로에서는 같은 재생 위치에 있는 프레임을 반복 변환하지 않는다.
  function frameReady() {
    pendingFrame = null;
    if (usesVideoFrames || video.currentTime !== lastTime) renderFrame();
    scheduleFrame();
  }

  // 일시정지, 탐색 또는 영상 교체 시 예약된 작업을 취소한다.
  function cancelFrame() {
    if (pendingFrame === null) return;
    if (usesVideoFrames) video.cancelVideoFrameCallback(pendingFrame);
    else cancelAnimationFrame(pendingFrame);
    pendingFrame = null;
  }

  // 첫 프레임이나 탐색 결과는 정지 상태에서도 바로 표시한다.
  function refreshFrame() {
    renderFrame();
    scheduleFrame();
  }

  // 정지하거나 재생이 끝나면 마지막 프레임을 표시하고 반복 작업을 멈춘다.
  function finishPlayback() {
    cancelFrame();
    renderFrame();
  }

  const resizeObserver = new ResizeObserver(measureCharacter);
  resizeObserver.observe(characterSample);
  measureCharacter();

  video.addEventListener("loadeddata", refreshFrame);
  video.addEventListener("playing", scheduleFrame);
  video.addEventListener("seeking", cancelFrame);
  video.addEventListener("seeked", refreshFrame);
  video.addEventListener("pause", finishPlayback);
  video.addEventListener("ended", finishPlayback);

  // 해상도가 바뀌면 재생 위치를 유지한 채 현재 프레임을 다시 그린다.
  function updateColumns(nextColumns: number) {
    if (columns === nextColumns) return;
    columns = nextColumns;
    measureCharacter();
  }

  // 영상이 바뀌면 이전 영상의 프레임 예약과 이벤트 연결을 정리한다.
  function stop() {
    cancelFrame();
    resizeObserver.disconnect();
    video.removeEventListener("loadeddata", refreshFrame);
    video.removeEventListener("playing", scheduleFrame);
    video.removeEventListener("seeking", cancelFrame);
    video.removeEventListener("seeked", refreshFrame);
    video.removeEventListener("pause", finishPlayback);
    video.removeEventListener("ended", finishPlayback);
    output.textContent = "";
  }

  return { updateColumns, stop };
}
