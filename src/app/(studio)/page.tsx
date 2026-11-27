"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { LuLockKeyhole } from "react-icons/lu";
import { AdjustmentsPanel } from "@/components/editor/adjustments-panel";
import { EditorLayout } from "@/components/editor/editor-layout";
import { VideoSelection } from "@/components/editor/video-selection";
import { AsciiPlayer } from "@/components/player/ascii-player";
import { Button } from "@/components/ui/button";
import { saveVideo } from "@/lib/save-video";
import { DEFAULT_DRAFT_SETTINGS, useEditorStore } from "@/stores/editorStore";
import styles from "./home.module.css";

export default function Home() {
  const router = useRouter();
  const draft = useEditorStore(
    (state) => state.drafts.find((draft) => draft.id === state.activeDraftId),
  );
  const setDraftFile = useEditorStore((state) => state.setDraftFile);
  const updateDraftSettings = useEditorStore((state) => state.updateDraftSettings);
  const latestSave = useRef(0);

  // 편집 패널의 설정만 초기화하고 재생 위치와 중앙 볼륨 값은 유지한다.
  function resetAdjustments() {
    if (draft) updateDraftSettings(draft.id, DEFAULT_DRAFT_SETTINGS);
  }

  // 클릭 시점의 파일과 설정을 저장하고 같은 임시 영상을 편집 중일 때 이동한다.
  async function handleSave() {
    if (!draft) return;

    const { id, file, settings } = draft;
    const request = ++latestSave.current;

    try {
      const { videoId } = await saveVideo(file, settings);
      const { activeDraftId, drafts } = useEditorStore.getState();
      if (request !== latestSave.current || window.location.pathname !== "/" || activeDraftId !== id) return;
      if (drafts.find((draft) => draft.id === id)?.file !== file) return;

      router.push(`/videos/${encodeURIComponent(videoId)}/edit`);
    } catch (error) {
      console.warn("Could not save the video.", error);
    }
  }

  const rightsNote = (
    <p className={styles.rightsNote}>
      <LuLockKeyhole aria-hidden="true" />
      Only select videos you have permission to use, including their audio.
    </p>
  );

  if (!draft) {
    return (
      <section className={styles.upload} aria-labelledby="upload-title">
        <h1 id="upload-title">Turn videos into text.</h1>
        <p className={styles.description}>Create and share your own ASCII videos.</p>
        <VideoSelection onVideoSelect={setDraftFile} />
        {rightsNote}
      </section>
    );
  }

  return (
    <EditorLayout
      preview={(
        <VideoSelection onVideoSelect={setDraftFile}>
          <AsciiPlayer source={draft.file} {...draft.settings} />
        </VideoSelection>
      )}
      adjustments={(
        <AdjustmentsPanel
          {...draft.settings}
          onColumnsChange={(columns) => updateDraftSettings(draft.id, { columns })}
          onToneChange={(tone) => updateDraftSettings(draft.id, { tone })}
          onAppearanceChange={(appearance) => updateDraftSettings(draft.id, { appearance })}
          onOutputVolumeChange={(outputVolume) => updateDraftSettings(draft.id, { outputVolume })}
          onReset={resetAdjustments}
        >
          <Button className={styles.saveButton} onClick={handleSave}>Save</Button>
        </AdjustmentsPanel>
      )}
      footer={(
        <>
          <p className={styles.selectionFeedback} role="status">
            Selected video: <strong>{draft.file.name}</strong>
          </p>
          {rightsNote}
        </>
      )}
    />
  );
}
