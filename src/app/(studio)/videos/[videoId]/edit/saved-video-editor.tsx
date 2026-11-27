"use client";

import { useRef, useState } from "react";
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
  shareUrl: string | null;
  savedSettings: VideoSettings;
};

export function SavedVideoEditor({ videoId, title, source, shareUrl, savedSettings }: SavedVideoEditorProps) {
  const [settings, setSettings] = useState(savedSettings);
  const shareInput = useRef<HTMLInputElement>(null);

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

  // 공유 주소를 복사하고, 클립보드를 쓸 수 없으면 주소 입력란을 선택한다.
  async function copyShareLink() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(new URL(shareUrl, window.location.origin).href);
    } catch {
      shareInput.current?.focus();
      shareInput.current?.select();
    }
  }

  return (
    <EditorLayout
      header={(
        <>
          <h1 className="wrap-anywhere text-lg font-semibold">{title}</h1>
          {shareUrl && (
            <div className="flex min-w-0 gap-2 sm:w-96">
              <input
                ref={shareInput}
                className="min-w-0 flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 text-sm"
                type="url"
                aria-label="Share link"
                readOnly
                value={shareUrl}
              />
              <Button variant="secondary" className="shrink-0" onClick={copyShareLink}>Copy link</Button>
            </div>
          )}
        </>
      )}
      preview={<AsciiPlayer source={source} {...settings} />}
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
