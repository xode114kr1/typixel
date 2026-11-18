import styles from "./adjustments-panel.module.css";

export function AdjustmentsPanel() {
  return (
    <aside className={styles.panel} aria-labelledby="adjustments-title">
      <h2 id="adjustments-title">Adjustments</h2>
    </aside>
  );
}
