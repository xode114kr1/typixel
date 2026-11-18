import styles from "./adjustments-panel.module.css";

type AdjustmentsPanelProps = {
  columns: number;
  onColumnsChange: (columns: number) => void;
};

export function AdjustmentsPanel({ columns, onColumnsChange }: AdjustmentsPanelProps) {
  return (
    <aside className={styles.panel} aria-labelledby="adjustments-title">
      <h2 id="adjustments-title">Adjustments</h2>
      <label className={styles.control}>
        Resolution
        <span aria-hidden="true">{columns} columns</span>
        <input
          type="range"
          min={32}
          max={96}
          value={columns}
          aria-valuetext={`${columns} columns`}
          onChange={(event) => onColumnsChange(event.currentTarget.valueAsNumber)}
        />
      </label>
    </aside>
  );
}
