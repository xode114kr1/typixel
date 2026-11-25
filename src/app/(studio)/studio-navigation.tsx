import Link, { type LinkProps } from "next/link";
import { LuPlus } from "react-icons/lu";
import styles from "./studio-navigation.module.css";

export function StudioNavigation({
  onNewVideo,
}: {
  onNewVideo: NonNullable<LinkProps["onNavigate"]>;
}) {
  return (
    <nav className={styles.navigation} aria-label="Studio">
      <Link href="/" className={styles.navLink} onNavigate={onNewVideo}>
        <LuPlus aria-hidden="true" />
        New video
      </Link>
      <section className={styles.videoSection}>
        <h2>Drafts</h2>
        <p>No drafts yet</p>
      </section>
      <section className={styles.videoSection}>
        <h2>My recent videos</h2>
        <p>No exported videos yet</p>
      </section>
    </nav>
  );
}
