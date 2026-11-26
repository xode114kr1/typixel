"use client";

import type { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { LuPanelLeft, LuX } from "react-icons/lu";
import { AccountMenu } from "@/components/auth/account-menu";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useEditorStore } from "@/stores/editorStore";
import styles from "./studio-layout.module.css";
import { StudioNavigation } from "./studio-navigation";

export default function StudioLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const activeDraftId = useEditorStore((state) => state.activeDraftId);
  const openNewVideo = useEditorStore((state) => state.openNewVideo);
  const selectDraft = useEditorStore((state) => state.selectDraft);
  const [expanded, setExpanded] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftVersion, setDraftVersion] = useState(0);
  const drawer = useRef<HTMLDialogElement>(null);

  // 데스크톱으로 전환할 때 열린 모달을 닫아 본문과 사이드바를 다시 조작할 수 있게 한다.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 48rem)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) drawer.current?.close();
    };

    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  /** 모바일 메뉴를 모달로 열어 키보드 포커스를 메뉴 안에 유지한다. */
  function openDrawer() {
    const dialog = drawer.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setDrawerOpen(true);
  }

  /** 현재 임시 영상의 선택을 해제하고, 스튜디오에 있으면 편집 UI를 초기화한다. */
  const handleNewVideo: NonNullable<LinkProps["onNavigate"]> = (event) => {
    drawer.current?.close();
    openNewVideo();
    if (window.location.pathname !== "/") return;

    event.preventDefault();
    setDraftVersion((version) => version + 1);
    window.scrollTo(0, 0);
  };

  /** 선택한 임시 영상을 열고 모바일 드로어를 닫는다. */
  function handleSelectDraft(id: string) {
    selectDraft(id);
    drawer.current?.close();
    if (window.location.pathname !== "/") router.push("/");
  }

  /** 로그아웃하면 저장된 영상 편집 화면에서 스튜디오로 돌아간다. */
  function handleSignedOut() {
    if (window.location.pathname !== "/") router.replace("/");
  }

  return (
    <div className={`${styles.studio} ${expanded ? "" : styles.collapsed}`}>
      <aside id="studio-sidebar" className={styles.sidebar} aria-label="Studio sidebar">
        <span className={styles.wordmark}>Typixel</span>
        <StudioNavigation onNewVideo={handleNewVideo} onSelectDraft={handleSelectDraft} />
      </aside>
      <dialog
        id="studio-drawer"
        ref={drawer}
        className={styles.drawer}
        aria-labelledby="studio-drawer-title"
        onClose={() => setDrawerOpen(false)}
        onClick={(event) => {
          // 패널 내부 클릭은 유지하고 바깥 배경을 클릭했을 때만 메뉴를 닫는다.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className={styles.drawerPanel}>
          <div className={styles.drawerHeader}>
            <h2 id="studio-drawer-title" className={styles.wordmark}>Typixel</h2>
            <Button
              variant="ghost"
              className={styles.iconButton}
              aria-label="Close navigation"
              onClick={() => drawer.current?.close()}
            >
              <LuX aria-hidden="true" />
            </Button>
          </div>
          <StudioNavigation onNewVideo={handleNewVideo} onSelectDraft={handleSelectDraft} />
        </div>
      </dialog>
      <div className={styles.content}>
        <header className={styles.header}>
          <Button
            variant="ghost"
            className={`${styles.iconButton} ${styles.desktopToggle}`}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-controls="studio-sidebar"
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
          >
            <LuPanelLeft aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            className={`${styles.iconButton} ${styles.mobileToggle}`}
            aria-label="Open navigation"
            aria-haspopup="dialog"
            aria-controls="studio-drawer"
            aria-expanded={drawerOpen}
            onClick={openDrawer}
          >
            <LuPanelLeft aria-hidden="true" />
          </Button>
          <span className={styles.mobileWordmark}>Typixel</span>
          <span>Studio</span>
          <div className={styles.account}>
            {session ? (
              <AccountMenu
                name={session.user.name}
                image={session.user.image}
                onSignOut={handleSignedOut}
              />
            ) : (
              <SignInDialog />
            )}
          </div>
        </header>
        <main className={styles.main}>
          <Fragment key={activeDraftId ?? draftVersion}>{children}</Fragment>
        </main>
      </div>
    </div>
  );
}
