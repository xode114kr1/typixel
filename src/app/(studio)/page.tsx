"use client";

import { useState } from "react";
import { LuLockKeyhole } from "react-icons/lu";
import { AdjustmentsPanel } from "@/components/editor/adjustments-panel";
import { VideoSelection } from "@/components/editor/video-selection";
import { AsciiPlayer } from "@/components/player/ascii-player";
import { DEFAULT_DRAFT_SETTINGS, useEditorStore } from "@/stores/editorStore";
import styles from "./home.module.css";

export default function Home() {
  const draft = useEditorStore(
    (state) => state.drafts.find((draft) => draft.id === state.activeDraftId),
  );
  const setDraftFile = useEditorStore((state) => state.setDraftFile);
  const updateDraftSettings = useEditorStore((state) => state.updateDraftSettings);
  const [preparedExport, setPreparedExport] = useState<{
    file: File;
    settings: typeof DEFAULT_DRAFT_SETTINGS;
  } | null>(null);

  // 편집 패널의 설정만 초기화하고 재생 위치와 중앙 볼륨 값은 유지한다.
  function resetAdjustments() {
    if (draft) updateDraftSettings(draft.id, DEFAULT_DRAFT_SETTINGS);
  }

  // 현재 편집 화면에서 Export 요청에 넘길 원본과 설정을 준비한다.
  function prepareExport() {
    if (draft) setPreparedExport({ file: draft.file, settings: draft.settings });
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
          onExport={prepareExport}
          exportStatus={
            preparedExport
              ? `Prepared locally: ${preparedExport.file.name} · ${preparedExport.settings.columns} columns · Output volume ${preparedExport.settings.outputVolume}%`
              : undefined
          }
        />
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
