import { create } from "zustand";

type VideoDraft = {
  id: string;
  file: File;
};

type EditorStore = {
  drafts: VideoDraft[];
  activeDraftId: string | null;
  setDraftFile: (file: File) => void;
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
        drafts: [...drafts, { id, file }],
        activeDraftId: id,
      };
    }),

  // 목록에 남아 있는 임시 영상만 활성화한다.
  selectDraft: (id) =>
    set((state) =>
      state.drafts.some((draft) => draft.id === id) ? { activeDraftId: id } : state,
    ),

  // 기존 임시 영상을 보관한 채 선택만 해제한다.
  openNewVideo: () => set({ activeDraftId: null }),
}));
