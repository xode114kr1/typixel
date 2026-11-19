"use client";

import { useState } from "react";
import { LuLockKeyhole } from "react-icons/lu";
import { AdjustmentsPanel } from "@/components/editor/adjustments-panel";
import { VideoSelection } from "@/components/editor/video-selection";
import { AsciiPlayer } from "@/components/player/ascii-player";
import { DEFAULT_ASCII_APPEARANCE, DEFAULT_ASCII_TONE } from "@/lib/ascii";
import { DEFAULT_ASCII_COLUMNS } from "@/lib/capture-ascii-frame";
import { MAX_OUTPUT_VOLUME } from "@/lib/video-volume";
import styles from "./home.module.css";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [columns, setColumns] = useState(DEFAULT_ASCII_COLUMNS);
  const [tone, setTone] = useState(DEFAULT_ASCII_TONE);
  const [appearance, setAppearance] = useState(DEFAULT_ASCII_APPEARANCE);
  const [outputVolume, setOutputVolume] = useState(MAX_OUTPUT_VOLUME);

  // 편집 패널의 설정만 초기화하고 재생 위치와 중앙 볼륨 값은 유지한다.
  function resetAdjustments() {
    setColumns(DEFAULT_ASCII_COLUMNS);
    setTone(DEFAULT_ASCII_TONE);
    setAppearance(DEFAULT_ASCII_APPEARANCE);
    setOutputVolume(MAX_OUTPUT_VOLUME);
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

      <VideoSelection onVideoSelect={setSelectedFile}>
        {selectedFile && (
          <AsciiPlayer
            file={selectedFile}
            columns={columns}
            tone={tone}
            appearance={appearance}
            outputVolume={outputVolume}
          />
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
      </div>

      <p className={styles.rightsNote}>
        <LuLockKeyhole aria-hidden="true" />
        Only select videos you have permission to use, including their audio.
      </p>
    </section>
  );
}
