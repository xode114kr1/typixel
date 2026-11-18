"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { LuLockKeyhole, LuUpload } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import styles from "./home.module.css";

export default function Home() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  // 공통 버튼을 눌렀을 때 브라우저의 기본 파일 선택창을 연다.
  function openFilePicker() {
    fileInput.current?.click();
  }

  // 선택 결과를 확인하고, 같은 파일을 다시 골라도 change 이벤트가 발생하도록 입력을 비운다.
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    if (!file) return;

    const isVideo = file.type
      ? file.type.startsWith("video/")
      : /\.(mp4|webm|mov)$/i.test(file.name);

    if (!isVideo) {
      setError("Choose a video file to continue.");
      return;
    }

    setSelectedFile(file);
    setError("");
  }

  return (
    <section className={styles.upload} aria-labelledby="upload-title">
      <h1 id="upload-title">Turn videos into text.</h1>
      <p className={styles.description}>Create and share your own ASCII videos.</p>

      <div className={styles.dropZone}>
        <Button
          variant="secondary"
          className={styles.uploadIcon}
          aria-label="Choose a video file"
          onClick={openFilePicker}
        >
          <LuUpload aria-hidden="true" />
        </Button>
        <h2>Select a video</h2>
        <p>Video formats such as MP4, WebM, and MOV</p>
        <input
          ref={fileInput}
          type="file"
          accept="video/*,.mp4,.webm,.mov"
          hidden
          onChange={handleFileChange}
        />
        <Button className={styles.chooseButton} onClick={openFilePicker}>
          Choose file
        </Button>
      </div>

      <div className={styles.selectionFeedback}>
        <p role="status">{selectedFile && <>Selected video: <strong>{selectedFile.name}</strong></>}</p>
        <p role="alert">{error}</p>
      </div>

      <p className={styles.rightsNote}>
        <LuLockKeyhole aria-hidden="true" />
        Only select videos you have permission to use, including their audio.
      </p>
    </section>
  );
}
