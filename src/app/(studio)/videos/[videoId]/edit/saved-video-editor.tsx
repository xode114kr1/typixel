"use client";

import { useState } from "react";
import { AdjustmentsPanel } from "@/components/editor/adjustments-panel";
import { EditorLayout } from "@/components/editor/editor-layout";
import { AsciiPlayer } from "@/components/player/ascii-player";
import { Button } from "@/components/ui/button";
import type { VideoSettings } from "@/lib/video-upload";
import { DEFAULT_DRAFT_SETTINGS } from "@/stores/editorStore";

type SavedVideoEditorProps = {
  videoId: string;
  title: string;
  source: string;
  savedSettings: VideoSettings;
};

export function SavedVideoEditor({ videoId, title, source, savedSettings }: SavedVideoEditorProps) {
  const [settings, setSettings] = useState(savedSettings);

  // Edit을 누른 시점의 편집 설정을 서버에 저장한다.
  async function handleEdit() {
    try {
      const response = await fetch(`/api/videos/${encodeURIComponent(videoId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) console.warn("Could not update the video settings.", response.status);
    } catch (error) {
      console.warn("Could not update the video settings.", error);
    }
  }

  return (
    <EditorLayout
      preview={(
        <div className="min-w-0">
          <h1 className="mb-4 wrap-anywhere text-lg font-semibold">{title}</h1>
          <AsciiPlayer source={source} {...settings} />
        </div>
      )}
      adjustments={(
        <AdjustmentsPanel
          {...settings}
          onColumnsChange={(columns) => setSettings((current) => ({ ...current, columns }))}
          onToneChange={(tone) => setSettings((current) => ({ ...current, tone }))}
          onAppearanceChange={(appearance) => setSettings((current) => ({ ...current, appearance }))}
          onOutputVolumeChange={(outputVolume) => setSettings((current) => ({ ...current, outputVolume }))}
          onReset={() => setSettings(DEFAULT_DRAFT_SETTINGS)}
        >
          <Button className="mt-5 w-full" onClick={handleEdit}>Edit</Button>
        </AdjustmentsPanel>
      )}
    />
  );
}
