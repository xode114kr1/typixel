"use client";

import { useEffect, useRef, useState } from "react";
import type { AsciiAppearance, AsciiTone } from "@/lib/ascii";
import { startAsciiPlayback } from "@/lib/ascii-playback";
import { PlaybackControls } from "./playback-controls";
import styles from "./ascii-player.module.css";

type AsciiPlayerProps = {
  source: File | string;
  columns: number;
  tone: AsciiTone;
  appearance: AsciiAppearance;
  outputVolume: number;
};

type PlayerError = { source: AsciiPlayerProps["source"]; message: string };

export function AsciiPlayer({ source, columns, tone, appearance, outputVolume }: AsciiPlayerProps) {
  const videoElement = useRef<HTMLVideoElement>(null);
  const playerElement = useRef<HTMLDivElement>(null);
  const characterSample = useRef<HTMLSpanElement>(null);
  const asciiOutput = useRef<HTMLPreElement>(null);
  const asciiPlayback = useRef<ReturnType<typeof startAsciiPlayback>>(null);
  const [playbackError, setPlaybackError] = useState<PlayerError | null>(null);
  const [captureError, setCaptureError] = useState<PlayerError | null>(null);

  // 로컬 파일에는 Object URL을 만들고, 영상이 바뀌거나 플레이어가 사라지면 정리한다.
  useEffect(() => {
    const video = videoElement.current;
    const output = asciiOutput.current;
    const sample = characterSample.current;
    if (!video || !output || !sample) return;

    const playback = startAsciiPlayback(video, output, sample, (message) => {
      setCaptureError({ source, message });
    });
    asciiPlayback.current = playback;
    const isUrl = typeof source === "string";
    const url = isUrl ? source : URL.createObjectURL(source);
    video.src = url;

    return () => {
      playback?.stop();
      asciiPlayback.current = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (!isUrl) URL.revokeObjectURL(url);
    };
  }, [source]);

  // 설정이 바뀌거나 영상을 교체하면 현재 값을 변환기에 전달한다.
  useEffect(() => {
    asciiPlayback.current?.updateColumns(columns);
    asciiPlayback.current?.updateTone(tone);
    asciiPlayback.current?.updateAppearance(appearance);
  }, [appearance, columns, source, tone]);

  // 화면과 재생 버튼 모두 같은 영상 요소의 재생 상태를 전환한다.
  async function togglePlayback() {
    const video = videoElement.current;
    if (!video || video.error || video.readyState < HTMLMediaElement.HAVE_METADATA) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    try {
      await video.play();
      setPlaybackError(null);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setPlaybackError({ source, message: "Playback could not start. Try playing the video again." });
    }
  }

  return (
    <div className={styles.player} ref={playerElement}>
      <video
        ref={videoElement}
        hidden
        playsInline
        crossOrigin={typeof source === "string" ? "anonymous" : undefined}
        preload="auto"
        onError={() => setPlaybackError({ source, message: "This video could not be played." })}
      />
      <div
        className={styles.asciiSurface}
        style={{ backgroundColor: appearance.backgroundColor }}
        role="button"
        tabIndex={0}
        aria-label="Play or pause video"
        onClick={togglePlayback}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          if (!event.repeat) void togglePlayback();
        }}
      >
        <div className={styles.asciiText} style={{ fontSize: `calc(153.6cqi / ${columns})` }}>
          <span className={styles.characterSample} ref={characterSample} aria-hidden="true">
            M
          </span>
          <pre ref={asciiOutput} aria-hidden="true" />
          <span className={styles.asciiPlaceholder}>Waiting for a video frame</span>
        </div>
      </div>
      <div>
        <PlaybackControls
          videoRef={videoElement}
          playerRef={playerElement}
          outputVolume={outputVolume}
          onTogglePlayback={togglePlayback}
        />
        <p className={styles.error} role="alert">{playbackError?.source === source && playbackError.message}</p>
        <p className={styles.error} role="alert">{captureError?.source === source && captureError.message}</p>
      </div>
    </div>
  );
}
