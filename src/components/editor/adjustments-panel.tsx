import { LuRotateCcw } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { ASCII_TONE_LIMITS, type AsciiAppearance, type AsciiCharacterSet, type AsciiTone } from "@/lib/ascii";
import { MAX_ASCII_COLUMNS, MIN_ASCII_COLUMNS } from "@/lib/capture-ascii-frame";
import { MAX_OUTPUT_VOLUME } from "@/lib/video-volume";
import styles from "./adjustments-panel.module.css";

type AdjustmentsPanelProps = {
  columns: number;
  tone: AsciiTone;
  appearance: AsciiAppearance;
  outputVolume: number;
  onColumnsChange: (columns: number) => void;
  onToneChange: (tone: AsciiTone) => void;
  onAppearanceChange: (appearance: AsciiAppearance) => void;
  onOutputVolumeChange: (volume: number) => void;
  onReset: () => void;
  onExport: () => void;
  shareUrl?: string;
  onCopyShareLink: () => void;
};

const toneControls = [
  { key: "brightness", label: "Brightness", step: 1, unit: "%" },
  { key: "contrast", label: "Contrast", step: 1, unit: "%" },
  { key: "gamma", label: "Gamma", step: 0.1, unit: "" },
  { key: "threshold", label: "Threshold", step: 1, unit: "%" },
] as const;

export function AdjustmentsPanel({
  columns,
  tone,
  appearance,
  outputVolume,
  onColumnsChange,
  onToneChange,
  onAppearanceChange,
  onOutputVolumeChange,
  onReset,
  onExport,
  shareUrl,
  onCopyShareLink,
}: AdjustmentsPanelProps) {
  return (
    <aside className={styles.panel} aria-labelledby="adjustments-title">
      <div className={styles.header}>
        <h2 id="adjustments-title">Adjustments</h2>
        <Button
          variant="ghost"
          className={styles.resetButton}
          aria-label="Reset adjustments"
          title="Reset adjustments"
          onClick={onReset}
        >
          <LuRotateCcw aria-hidden="true" />
        </Button>
      </div>
      <label className={styles.control}>
        Resolution
        <span aria-hidden="true">{columns} columns</span>
        <input
          type="range"
          min={MIN_ASCII_COLUMNS}
          max={MAX_ASCII_COLUMNS}
          value={columns}
          aria-valuetext={`${columns} columns`}
          onChange={(event) => onColumnsChange(event.currentTarget.valueAsNumber)}
        />
      </label>
      {toneControls.map(({ key, label, step, unit }) => (
        <label key={key} className={styles.control}>
          {label}
          <span aria-hidden="true">{tone[key]}{unit}</span>
          <input
            type="range"
            {...ASCII_TONE_LIMITS[key]}
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
      <label className={styles.control}>
        Output volume
        <span aria-hidden="true">{outputVolume}%</span>
        <input
          type="range"
          min={0}
          max={MAX_OUTPUT_VOLUME}
          value={outputVolume}
          aria-valuetext={`${outputVolume}%`}
          aria-describedby="output-volume-description"
          onChange={(event) => onOutputVolumeChange(event.currentTarget.valueAsNumber)}
        />
      </label>
      <p id="output-volume-description" className={styles.note}>
        This level is used for saved videos. The player volume applies only to playback.
      </p>
      <Button className={styles.exportButton} onClick={onExport}>Export</Button>
      {shareUrl && (
        <div className={styles.shareLink}>
          <label>
            Share link
            <input type="url" readOnly value={shareUrl} />
          </label>
          <Button variant="secondary" onClick={onCopyShareLink}>Copy link</Button>
        </div>
      )}
    </aside>
  );
}
