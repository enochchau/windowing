import { NumberInput } from "./NumberInput";
import css from "./Settings.module.css";

interface SettingsProps {
  fixedRows: string;
  fixedColumns: string;
  onFixedRowsChange: (value: string) => void;
  onFixedColumnsChange: (value: string) => void;
}

export function Settings({
  fixedRows,
  fixedColumns,
  onFixedRowsChange,
  onFixedColumnsChange,
}: SettingsProps) {
  return (
    <div className={css.container}>
      <h4 className={css.title}>Grid Settings</h4>
      <div className={css.inputGroup}>
        <NumberInput
          label="Fixed Rows"
          value={fixedRows}
          onChange={onFixedRowsChange}
          min={0}
        />
      </div>
      <div className={css.inputGroup}>
        <NumberInput
          label="Fixed Columns"
          value={fixedColumns}
          onChange={onFixedColumnsChange}
          min={0}
        />
      </div>
    </div>
  );
}
