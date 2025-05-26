import css from "./NumberInput.module.css";

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  placeholder,
}: NumberInputProps) {
  return (
    <div className={css.container}>
      <label className={css.label}>{label}</label>
      <input
        type="number"
        className={css.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        placeholder={placeholder}
      />
    </div>
  );
}
