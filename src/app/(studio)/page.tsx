"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { LuLockKeyhole, LuUpload } from "react-icons/lu";
import { AdjustmentsPanel } from "@/components/editor/adjustments-panel";
import { PlaybackControls } from "@/components/player/playback-controls";
import { Button } from "@/components/ui/button";
import { startAsciiPlayback } from "@/lib/ascii-playback";
import {
  DEFAULT_ASCII_BRIGHTNESS,
  DEFAULT_ASCII_COLUMNS,
  DEFAULT_ASCII_CONTRAST,
} from "@/lib/capture-ascii-frame";
import styles from "./home.module.css";

export default function Home() {
  const fileInput = useRef<HTMLInputElement>(null);
  const videoElement = useRef<HTMLVideoElement>(null);
  const characterSample = useRef<HTMLSpanElement>(null);
  const asciiOutput = useRef<HTMLPreElement>(null);
  const asciiPlayback = useRef<ReturnType<typeof startAsciiPlayback>>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [playbackError, setPlaybackError] = useState("");
  const [captureError, setCaptureError] = useState("");
  const [columns, setColumns] = useState(DEFAULT_ASCII_COLUMNS);
  const [brightness, setBrightness] = useState(DEFAULT_ASCII_BRIGHTNESS);
  const [contrast, setContrast] = useState(DEFAULT_ASCII_CONTRAST);

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
    asciiPlayback.current?.updateBrightness(brightness);
    asciiPlayback.current?.updateContrast(contrast);
  }, [brightness, columns, contrast, selectedFile]);

  // 공통 버튼을 눌렀을 때 브라우저의 기본 파일 선택창을 연다.
  function openFilePicker() {
    fileInput.current?.click();
  }

  // 같은 파일을 다시 골라도 change 이벤트가 발생하도록 입력을 비운다.
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    if (file) selectVideo(file);
  }

  // 파일을 고른 방식에 관계없이 같은 기준으로 영상 여부를 확인한다.
  function selectVideo(file: File) {
    const isVideo = file.type
      ? file.type.startsWith("video/")
      : /\.(mp4|webm|mov)$/i.test(file.name);

    if (!isVideo) {
      setError("Choose a video file to continue.");
      return;
    }

    setSelectedFile(file);
    setError("");
    setPlaybackError("");
    setCaptureError("");
  }

  // 자식 요소를 지날 때도 dragenter가 발생하므로 진입 횟수를 기록한다.
  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes("Files")) return;

    dragDepth.current += 1;
    setIsDragging(true);
  }

  // 마지막 요소를 벗어났을 때만 드롭 영역의 강조를 해제한다.
  function handleDragLeave() {
    if (dragDepth.current === 0) return;

    dragDepth.current -= 1;
    if (dragDepth.current === 0) setIsDragging(false);
  }

  // 파일이 끌려오는 동안 브라우저의 기본 동작을 막아 drop 이벤트가 발생하게 한다.
  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes("Files")) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  // 드롭이 끝나면 강조를 해제하고 한 개의 영상만 선택한다.
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files.length > 1) {
      setError("Choose one video at a time.");
      return;
    }

    const file = files[0];
    if (file) selectVideo(file);
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

      <input
        ref={fileInput}
        type="file"
        accept="video/*,.mp4,.webm,.mov"
        hidden
        onChange={handleFileChange}
      />

      <div
        className={isDragging ? `${styles.dropZone} ${styles.dropZoneActive}` : styles.dropZone}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className={styles.player}>
            <video
              ref={videoElement}
              hidden
              playsInline
              preload="auto"
              onError={() => setPlaybackError("This video could not be played. Try another file.")}
            />
            <div className={styles.asciiSurface}>
              <div
                className={styles.asciiText}
                style={{ fontSize: `calc(2.4cqi * ${DEFAULT_ASCII_COLUMNS} / ${columns})` }}
              >
                <span className={styles.characterSample} ref={characterSample} aria-hidden="true">
                  M
                </span>
                <pre ref={asciiOutput} aria-hidden="true" />
                <span className={styles.asciiPlaceholder}>Waiting for a video frame</span>
              </div>
            </div>
            <PlaybackControls videoRef={videoElement} onError={setPlaybackError} />
          </div>
        ) : (
          <>
            <Button
              variant="secondary"
              className={styles.uploadIcon}
              aria-label="Choose a video file"
              onClick={openFilePicker}
            >
              <LuUpload aria-hidden="true" />
            </Button>
            <h2>Drag and drop a video</h2>
            <p>Video formats such as MP4, WebM, and MOV</p>
          </>
        )}
        <div className={styles.previewActions}>
          <Button className={styles.chooseButton} onClick={openFilePicker}>
            {selectedFile ? "Change video" : "Choose file"}
          </Button>
        </div>
      </div>

      {selectedFile && (
        <AdjustmentsPanel
          columns={columns}
          brightness={brightness}
          contrast={contrast}
          onColumnsChange={setColumns}
          onBrightnessChange={setBrightness}
          onContrastChange={setContrast}
        />
      )}

      <div className={styles.selectionFeedback}>
        <p role="status">{selectedFile && <>Selected video: <strong>{selectedFile.name}</strong></>}</p>
        <p role="alert">{error}</p>
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
