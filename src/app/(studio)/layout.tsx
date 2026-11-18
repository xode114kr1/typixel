import type { ReactNode } from "react";
import styles from "./studio-layout.module.css";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.studio}>
      <aside className={styles.sidebar} aria-label="Studio sidebar">
        <span className={styles.wordmark}>Typixel</span>
      </aside>
      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.mobileWordmark}>Typixel</span>
          <span>Studio</span>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
