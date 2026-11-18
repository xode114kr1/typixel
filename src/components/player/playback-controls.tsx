"use client";

import { useEffect, useState, type RefObject } from "react";
import { LuMaximize, LuPause, LuPlay, LuVolume2, LuVolumeX } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { getPreviewGain, MAX_PREVIEW_VOLUME } from "@/lib/video-volume";
import styles from "./playback-controls.module.css";

type PlaybackControlsProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  outputVolume: number;
  onError: (message: string) => void;
};

/** 재생 시간을 분과 초로 표시한다. */
function formatTime(seconds: number) {
  const wholeSeconds = Math.floor(seconds);
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

export function PlaybackControls({ videoRef, outputVolume, onError }: PlaybackControlsProps) {
  const [playback, setPlayback] = useState({ ready: false, paused: true, time: 0, duration: 0 });
  const [previewVolume, setPreviewVolume] = useState(MAX_PREVIEW_VOLUME);
  const previewGain = getPreviewGain(outputVolume, previewVolume);

  // 우측 설정과 중앙 슬라이더를 곱한 배율만 미리보기 영상에 적용한다.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = previewGain;
    video.muted = previewGain === 0;
  }, [previewGain, videoRef]);

  // 영상 이벤트를 기준으로 컨트롤을 동기화하고, ASCII 프레임 반복과는 별도로 갱신한다.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const events = ["loadedmetadata", "progress", "durationchange", "timeupdate", "play", "pause", "ended", "emptied", "error"];

    function syncControls() {
      if (!video) return;
      const { seekable, duration } = video;
      setPlayback({
        ready: video.readyState >= HTMLMediaElement.HAVE_METADATA && !video.error,
        paused: video.paused || video.ended,
        time: video.currentTime,
        duration: Number.isFinite(duration) ? duration : seekable.length ? seekable.end(seekable.length - 1) : 0,
      });
    }

    for (const event of events) video.addEventListener(event, syncControls);
    syncControls();

    return () => {
      for (const event of events) video.removeEventListener(event, syncControls);
    };
  }, [videoRef]);

  // 재생과 일시정지는 원본 영상에 적용되어 화면과 오디오가 함께 움직인다.
  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    try {
      await video.play();
      onError("");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      onError("Playback could not start. Try playing the video again.");
    }
  }

  // 슬라이더에서 선택한 시각으로 원본 영상의 재생 위치를 옮긴다.
  function seek(time: number) {
    const video = videoRef.current;
    if (video) video.currentTime = time;
  }

  return (
    <div aria-label="Playback controls" role="group">
      <div className={styles.controls}>
        <Button
          variant="secondary"
          className={styles.iconButton}
          aria-label={playback.paused ? "Play video" : "Pause video"}
          disabled={!playback.ready}
          onClick={togglePlayback}
        >
          {playback.paused ? <LuPlay aria-hidden="true" /> : <LuPause aria-hidden="true" />}
        </Button>
        <input
          className={styles.timeline}
          type="range"
          min={0}
          max={playback.duration || 1}
          step="any"
          value={Math.min(playback.time, playback.duration)}
          aria-label="Video position"
          aria-valuetext={`${formatTime(playback.time)} of ${formatTime(playback.duration)}`}
          disabled={!playback.ready || !playback.duration}
          onChange={(event) => seek(event.currentTarget.valueAsNumber)}
        />
        <span className={styles.time} aria-hidden="true">
          {formatTime(playback.time)} / {formatTime(playback.duration)}
        </span>
        <Button
          variant="secondary"
          className={styles.iconButton}
          aria-label="Enter fullscreen"
          disabled
        >
          <LuMaximize aria-hidden="true" />
        </Button>
      </div>
      <label className={styles.volume}>
        {previewGain === 0 ? <LuVolumeX aria-hidden="true" /> : <LuVolume2 aria-hidden="true" />}
        <span>Preview volume</span>
        <input
          className={styles.volumeSlider}
          type="range"
          min={0}
          max={MAX_PREVIEW_VOLUME}
          value={previewVolume}
          onChange={(event) => setPreviewVolume(event.currentTarget.valueAsNumber)}
        />
        <span className={styles.volumeValue} aria-hidden="true">{previewVolume} / {MAX_PREVIEW_VOLUME}</span>
      </label>
    </div>
  );
}
