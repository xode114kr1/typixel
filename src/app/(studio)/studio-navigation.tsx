import Link, { type LinkProps } from "next/link";
import { LuPlus } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/stores/editorStore";
import styles from "./studio-navigation.module.css";

export function StudioNavigation({
  onNewVideo,
  onSelectDraft,
}: {
  onNewVideo: NonNullable<LinkProps["onNavigate"]>;
  onSelectDraft: (id: string) => void;
}) {
  const drafts = useEditorStore((state) => state.drafts);
  const activeDraftId = useEditorStore((state) => state.activeDraftId);

  return (
    <nav className={styles.navigation} aria-label="Studio">
      <Link href="/" className={styles.navLink} onNavigate={onNewVideo}>
        <LuPlus aria-hidden="true" />
        New video
      </Link>
      <div className={styles.videoSections}>
        <section className={styles.videoSection}>
          <h2>Drafts</h2>
          {drafts.length > 0 ? (
            <ul>
              {drafts.map(({ id, file }) => (
                <li key={id}>
                  <Button
                    variant="ghost"
                    aria-current={id === activeDraftId ? true : undefined}
                    title={file.name}
                    onClick={() => onSelectDraft(id)}
                  >
                    {file.name}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No drafts yet</p>
          )}
        </section>
        <section className={styles.videoSection}>
          <h2>My recent videos</h2>
          <p>No exported videos yet</p>
        </section>
      </div>
    </nav>
  );
}
