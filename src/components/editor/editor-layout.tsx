import type { ReactNode } from "react";
import styles from "./editor-layout.module.css";

type EditorLayoutProps = {
  header?: ReactNode;
  preview: ReactNode;
  adjustments: ReactNode;
  footer?: ReactNode;
};

export function EditorLayout({ header, preview, adjustments, footer }: EditorLayoutProps) {
  return (
    <section className={styles.editor} aria-label="Video editor">
      {header && <header className={styles.header}>{header}</header>}
      {preview}
      {adjustments}
      {footer && <div className={styles.footer}>{footer}</div>}
    </section>
  );
}
