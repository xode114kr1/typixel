import Link, { type LinkProps } from "next/link";
import { LuFilm, LuPlus } from "react-icons/lu";
import { Button } from "@/components/ui/button";
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
      <Button disabled variant="ghost" className={styles.navLink}>
        <LuFilm aria-hidden="true" />
        My videos
      </Button>
    </nav>
  );
}
