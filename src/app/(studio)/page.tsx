"use client";

import { useEffect, useRef, useState } from "react";
import { LuLockKeyhole } from "react-icons/lu";
import { AdjustmentsPanel } from "@/components/editor/adjustments-panel";
import { VideoSelection } from "@/components/editor/video-selection";
import { PlaybackControls } from "@/components/player/playback-controls";
import { startAsciiPlayback } from "@/lib/ascii-playback";
import { DEFAULT_ASCII_APPEARANCE, DEFAULT_ASCII_TONE } from "@/lib/ascii";
import { DEFAULT_ASCII_COLUMNS } from "@/lib/capture-ascii-frame";
import { MAX_OUTPUT_VOLUME } from "@/lib/video-volume";
import styles from "./home.module.css";

export default function Home() {
  const videoElement = useRef<HTMLVideoElement>(null);
  const playerElement = useRef<HTMLDivElement>(null);
  const characterSample = useRef<HTMLSpanElement>(null);
  const asciiOutput = useRef<HTMLPreElement>(null);
  const asciiPlayback = useRef<ReturnType<typeof startAsciiPlayback>>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [playbackError, setPlaybackError] = useState("");
  const [captureError, setCaptureError] = useState("");
  const [columns, setColumns] = useState(DEFAULT_ASCII_COLUMNS);
  const [tone, setTone] = useState(DEFAULT_ASCII_TONE);
  const [appearance, setAppearance] = useState(DEFAULT_ASCII_APPEARANCE);
  const [outputVolume, setOutputVolume] = useState(MAX_OUTPUT_VOLUME);

  // 선택한 파일을 브라우저에서 직접 재생하고, 영상이 바뀌거나 페이지를 떠나면 URL을 해제한다.
  useEffect(() => {
    const video = videoElement.current;
    const output = asciiOutput.current;
    const sample = characterSample.current;
    if (!selectedFile || !video || !output || !sample) return;

    const playback = startAsciiPlayback(video, output, sample, setCaptureError);
    asciiPlayback.current = playback;
    const url = URL.createObjectURL(selectedFile);
    video.src = url;

    return () => {
      playback?.stop();
      asciiPlayback.current = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  // 설정이 바뀌거나 영상을 교체하면 현재 슬라이더 값을 변환기에 전달한다.
  useEffect(() => {
    asciiPlayback.current?.updateColumns(columns);
    asciiPlayback.current?.updateTone(tone);
    asciiPlayback.current?.updateAppearance(appearance);
  }, [appearance, columns, selectedFile, tone]);

  // 편집 패널의 설정만 초기화하고 재생 위치와 중앙 볼륨 값은 유지한다.
  function resetAdjustments() {
    setColumns(DEFAULT_ASCII_COLUMNS);
    setTone(DEFAULT_ASCII_TONE);
    setAppearance(DEFAULT_ASCII_APPEARANCE);
    setOutputVolume(MAX_OUTPUT_VOLUME);
  }

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
      setPlaybackError("");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setPlaybackError("Playback could not start. Try playing the video again.");
    }
  }

  // 새 파일을 받으면 이전 영상의 재생·변환 오류를 지운다.
  function handleVideoSelect(file: File) {
    setSelectedFile(file);
    setPlaybackError("");
    setCaptureError("");
  }

  return (
    <section
      className={`${styles.upload} ${selectedFile ? styles.preview : ""}`}
      aria-labelledby={selectedFile ? undefined : "upload-title"}
      aria-label={selectedFile ? "Video editor" : undefined}
    >
      {!selectedFile && (
        <>
          <h1 id="upload-title">Turn videos into text.</h1>
          <p className={styles.description}>Create and share your own ASCII videos.</p>
        </>
      )}

      <VideoSelection onVideoSelect={handleVideoSelect}>
        {selectedFile && (
          <div className={styles.player} ref={playerElement}>
            <video
              ref={videoElement}
              hidden
              playsInline
              preload="auto"
              onError={() => setPlaybackError("This video could not be played. Try another file.")}
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
              <div
                className={styles.asciiText}
                style={{ fontSize: `calc(153.6cqi / ${columns})` }}
              >
                <span className={styles.characterSample} ref={characterSample} aria-hidden="true">
                  M
                </span>
                <pre ref={asciiOutput} aria-hidden="true" />
                <span className={styles.asciiPlaceholder}>Waiting for a video frame</span>
              </div>
            </div>
            <PlaybackControls
              videoRef={videoElement}
              playerRef={playerElement}
              outputVolume={outputVolume}
              onTogglePlayback={togglePlayback}
            />
          </div>
        )}
      </VideoSelection>

      {selectedFile && (
        <AdjustmentsPanel
          columns={columns}
          tone={tone}
          appearance={appearance}
          outputVolume={outputVolume}
          onColumnsChange={setColumns}
          onToneChange={setTone}
          onAppearanceChange={setAppearance}
          onOutputVolumeChange={setOutputVolume}
          onReset={resetAdjustments}
        />
      )}

      <div className={styles.selectionFeedback}>
        <p role="status">{selectedFile && <>Selected video: <strong>{selectedFile.name}</strong></>}</p>
        <p role="alert">{playbackError}</p>
        <p role="alert">{captureError}</p>
      </div>

      <p className={styles.rightsNote}>
        <LuLockKeyhole aria-hidden="true" />
        Only select videos you have permission to use, including their audio.
      </p>
    </section>
  );
}
