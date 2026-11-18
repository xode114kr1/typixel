import type { AsciiAppearance, AsciiCharacterSet, AsciiTone } from "@/lib/ascii";
import styles from "./adjustments-panel.module.css";

type AdjustmentsPanelProps = {
  columns: number;
  tone: AsciiTone;
  appearance: AsciiAppearance;
  onColumnsChange: (columns: number) => void;
  onToneChange: (tone: AsciiTone) => void;
  onAppearanceChange: (appearance: AsciiAppearance) => void;
};

const toneControls = [
  { key: "brightness", label: "Brightness", min: 0, max: 200, step: 1, unit: "%" },
  { key: "contrast", label: "Contrast", min: 0, max: 200, step: 1, unit: "%" },
  { key: "gamma", label: "Gamma", min: 0.1, max: 3, step: 0.1, unit: "" },
  { key: "threshold", label: "Threshold", min: 0, max: 100, step: 1, unit: "%" },
] as const;

export function AdjustmentsPanel({
  columns,
  tone,
  appearance,
  onColumnsChange,
  onToneChange,
  onAppearanceChange,
}: AdjustmentsPanelProps) {
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
      {toneControls.map(({ key, label, min, max, step, unit }) => (
        <label key={key} className={styles.control}>
          {label}
          <span aria-hidden="true">{tone[key]}{unit}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={tone[key]}
            aria-valuetext={`${tone[key]}${unit}`}
            onChange={(event) => onToneChange({ ...tone, [key]: event.currentTarget.valueAsNumber })}
          />
        </label>
      ))}
      <label className={styles.control}>
        Character set
        <select
          value={appearance.characterSet}
          onChange={(event) => onAppearanceChange({
            ...appearance,
            characterSet: event.currentTarget.value as AsciiCharacterSet,
          })}
        >
          <option value="standard">Standard</option>
          <option value="minimal">Minimal</option>
          <option value="binary">Binary</option>
        </select>
      </label>
      <label className={styles.control}>
        Color mode
        <select
          value={appearance.mode}
          onChange={(event) => onAppearanceChange({
            ...appearance,
            mode: event.currentTarget.value as AsciiAppearance["mode"],
          })}
        >
          <option value="monochrome">Monochrome</option>
          <option value="color">Original colors</option>
        </select>
      </label>
      <label className={styles.colorControl}>
        Background color
        <input
          type="color"
          value={appearance.backgroundColor}
          onChange={(event) => onAppearanceChange({ ...appearance, backgroundColor: event.currentTarget.value })}
        />
      </label>
    </aside>
  );
}
