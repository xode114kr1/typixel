import type { ReactNode } from "react";
import styles from "./editor-layout.module.css";

type EditorLayoutProps = {
  preview: ReactNode;
  adjustments: ReactNode;
  footer?: ReactNode;
};

export function EditorLayout({ preview, adjustments, footer }: EditorLayoutProps) {
  return (
    <section className={styles.editor} aria-label="Video editor">
      {preview}
      {adjustments}
      {footer && <div className={styles.footer}>{footer}</div>}
    </section>
  );
}
