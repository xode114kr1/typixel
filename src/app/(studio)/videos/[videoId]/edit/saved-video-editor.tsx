"use client";

import { useState } from "react";
import { AdjustmentsPanel } from "@/components/editor/adjustments-panel";
import { EditorLayout } from "@/components/editor/editor-layout";
import { AsciiPlayer } from "@/components/player/ascii-player";
import type { VideoSettings } from "@/lib/video-upload";
import { DEFAULT_DRAFT_SETTINGS } from "@/stores/editorStore";

type SavedVideoEditorProps = {
  title: string;
  source: string;
  savedSettings: VideoSettings;
};

export function SavedVideoEditor({ title, source, savedSettings }: SavedVideoEditorProps) {
  const [settings, setSettings] = useState(savedSettings);

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
        />
      )}
    />
  );
}
