"use client";

import { useState } from "react";
import { LuLockKeyhole } from "react-icons/lu";
import { AdjustmentsPanel } from "@/components/editor/adjustments-panel";
import { VideoSelection } from "@/components/editor/video-selection";
import { AsciiPlayer } from "@/components/player/ascii-player";
import { Button } from "@/components/ui/button";
import { exportVideo } from "@/lib/export-video";
import { DEFAULT_DRAFT_SETTINGS, useEditorStore } from "@/stores/editorStore";
import styles from "./home.module.css";

export default function Home() {
  const draft = useEditorStore(
    (state) => state.drafts.find((draft) => draft.id === state.activeDraftId),
  );
  const setDraftFile = useEditorStore((state) => state.setDraftFile);
  const updateDraftSettings = useEditorStore((state) => state.updateDraftSettings);
  const [exportResult, setExportResult] = useState<{
    file: File;
    shareUrl?: string;
  } | null>(null);
  const currentShareUrl = exportResult?.file === draft?.file ? exportResult?.shareUrl : undefined;

  // 편집 패널의 설정만 초기화하고 재생 위치와 중앙 볼륨 값은 유지한다.
  function resetAdjustments() {
    if (draft) updateDraftSettings(draft.id, DEFAULT_DRAFT_SETTINGS);
  }

  // 버튼을 누른 시점의 파일과 설정을 저장하고 마지막 요청의 결과를 표시한다.
  async function handleExport() {
    if (!draft) return;

    const { file, settings } = draft;
    const request = { file };
    setExportResult(request);

    try {
      const { shareId } = await exportVideo(file, settings);
      const shareUrl = new URL(`/watch/${encodeURIComponent(shareId)}`, window.location.origin).href;
      setExportResult((result) => result === request ? { file, shareUrl } : result);
    } catch (error) {
      console.warn("Could not export the video.", error);
    }
  }

  // 표시된 공유 링크를 클립보드에 복사한다.
  async function copyShareLink() {
    if (!currentShareUrl) return;

    try {
      await navigator.clipboard.writeText(currentShareUrl);
    } catch (error) {
      console.warn("Could not copy the share link.", error);
    }
  }

  return (
    <section
      className={`${styles.upload} ${draft ? styles.preview : ""}`}
      aria-labelledby={draft ? undefined : "upload-title"}
      aria-label={draft ? "Video editor" : undefined}
    >
      {!draft && (
        <>
          <h1 id="upload-title">Turn videos into text.</h1>
          <p className={styles.description}>Create and share your own ASCII videos.</p>
        </>
      )}

      <VideoSelection onVideoSelect={setDraftFile}>
        {draft && <AsciiPlayer file={draft.file} {...draft.settings} />}
      </VideoSelection>

      {draft && (
        <AdjustmentsPanel
          {...draft.settings}
          onColumnsChange={(columns) => updateDraftSettings(draft.id, { columns })}
          onToneChange={(tone) => updateDraftSettings(draft.id, { tone })}
          onAppearanceChange={(appearance) => updateDraftSettings(draft.id, { appearance })}
          onOutputVolumeChange={(outputVolume) => updateDraftSettings(draft.id, { outputVolume })}
          onReset={resetAdjustments}
        >
          <Button className={styles.exportButton} onClick={handleExport}>Export</Button>
          {currentShareUrl && (
            <div className={styles.shareLink}>
              <label>
                Share link
                <input type="url" readOnly value={currentShareUrl} />
              </label>
              <Button variant="secondary" onClick={copyShareLink}>Copy link</Button>
            </div>
          )}
        </AdjustmentsPanel>
      )}

      <div className={styles.selectionFeedback}>
        <p role="status">{draft && <>Selected video: <strong>{draft.file.name}</strong></>}</p>
      </div>

      <p className={styles.rightsNote}>
        <LuLockKeyhole aria-hidden="true" />
        Only select videos you have permission to use, including their audio.
      </p>
    </section>
  );
}
