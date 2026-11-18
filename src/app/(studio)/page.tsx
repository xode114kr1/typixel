import { LuLockKeyhole, LuUpload } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import styles from "./home.module.css";

export default function Home() {
  return (
    <section className={styles.upload} aria-labelledby="upload-title">
      <h1 id="upload-title">Turn videos into text.</h1>
      <p className={styles.description}>Create and share your own ASCII videos.</p>

      <div className={styles.dropZone}>
        <span className={styles.uploadIcon}>
          <LuUpload aria-hidden="true" />
        </span>
        <h2>Drag and drop a video</h2>
        <p>Video formats such as MP4, WebM, and MOV</p>
        <Button className={styles.chooseButton} disabled>Choose file</Button>
      </div>

      <p className={styles.rightsNote}>
        <LuLockKeyhole aria-hidden="true" />
        Only select videos you have permission to use, including their audio.
      </p>
    </section>
  );
}
