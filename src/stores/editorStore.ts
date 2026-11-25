import { create } from "zustand";
import {
  DEFAULT_ASCII_APPEARANCE,
  DEFAULT_ASCII_TONE,
  type AsciiAppearance,
  type AsciiTone,
} from "@/lib/ascii";
import { DEFAULT_ASCII_COLUMNS } from "@/lib/capture-ascii-frame";
import { MAX_OUTPUT_VOLUME } from "@/lib/video-volume";

type DraftSettings = {
  columns: number;
  tone: AsciiTone;
  appearance: AsciiAppearance;
  outputVolume: number;
};

export const DEFAULT_DRAFT_SETTINGS: DraftSettings = {
  columns: DEFAULT_ASCII_COLUMNS,
  tone: DEFAULT_ASCII_TONE,
  appearance: DEFAULT_ASCII_APPEARANCE,
  outputVolume: MAX_OUTPUT_VOLUME,
};

type VideoDraft = {
  id: string;
  file: File;
  settings: DraftSettings;
};

type EditorStore = {
  drafts: VideoDraft[];
  activeDraftId: string | null;
  setDraftFile: (file: File) => void;
  updateDraftSettings: (id: string, changes: Partial<DraftSettings>) => void;
  selectDraft: (id: string) => void;
  openNewVideo: () => void;
};

export const useEditorStore = create<EditorStore>()((set) => ({
  drafts: [],
  activeDraftId: null,

  // 빈 편집 화면에서는 임시 영상을 만들고, 편집 중이면 현재 영상의 파일을 교체한다.
  setDraftFile: (file) =>
    set(({ activeDraftId, drafts }) => {
      if (activeDraftId !== null) {
        return {
          drafts: drafts.map((draft) =>
            draft.id === activeDraftId ? { ...draft, file } : draft,
          ),
        };
      }

      const id = crypto.randomUUID();
      return {
        drafts: [...drafts, { id, file, settings: DEFAULT_DRAFT_SETTINGS }],
        activeDraftId: id,
      };
    }),

  // 편집 이벤트가 발생한 영상의 설정만 바꾼다.
  updateDraftSettings: (id, changes) =>
    set(({ drafts }) => ({
      drafts: drafts.map((draft) =>
        draft.id === id
          ? { ...draft, settings: { ...draft.settings, ...changes } }
          : draft,
      ),
    })),

  // 목록에 남아 있는 임시 영상만 활성화한다.
  selectDraft: (id) =>
    set((state) =>
      state.drafts.some((draft) => draft.id === id) ? { activeDraftId: id } : state,
    ),

  // 기존 임시 영상을 보관한 채 선택만 해제한다.
  openNewVideo: () => set({ activeDraftId: null }),
}));
