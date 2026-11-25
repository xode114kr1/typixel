"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { LuFilm, LuPanelLeft, LuPlus, LuX } from "react-icons/lu";
import { AccountMenu } from "@/components/auth/account-menu";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import styles from "./studio-layout.module.css";

export default function StudioLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
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

  const navigation = (
    <nav className={styles.navigation} aria-label="Studio">
      <Link
        href="/"
        className={styles.navLink}
        onNavigate={(event) => {
          drawer.current?.close();
          if (pathname !== "/") return;

          // 같은 페이지에서는 편집 영역만 새로 만들어 영상과 설정을 정리한다.
          event.preventDefault();
          setDraftVersion((version) => version + 1);
          window.scrollTo(0, 0);
        }}
      >
        <LuPlus aria-hidden="true" />
        New video
      </Link>
      <Button disabled variant="ghost" className={styles.navLink}>
        <LuFilm aria-hidden="true" />
        My videos
      </Button>
    </nav>
  );

  return (
    <div className={`${styles.studio} ${expanded ? "" : styles.collapsed}`}>
      <aside id="studio-sidebar" className={styles.sidebar} aria-label="Studio sidebar">
        <span className={styles.wordmark}>Typixel</span>
        {navigation}
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
          {navigation}
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
              <AccountMenu name={session.user.name} />
            ) : (
              <SignInDialog />
            )}
          </div>
        </header>
        <main className={styles.main}>
          <Fragment key={draftVersion}>{children}</Fragment>
        </main>
      </div>
    </div>
  );
}
