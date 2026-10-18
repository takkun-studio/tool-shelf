import type { Field } from '../lib/tools';

export function NumberField({ field, value, error, onChange }: {
  field: Field;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const id = `field-${field.key}`;
  return <div className="field">
    <label htmlFor={id}>{field.label}<span>{field.unit}</span></label>
    {field.options
      ? <select id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}>
          <option value="">選択してください</option>
          {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      : <input
          id={id}
          inputMode={field.allowDecimal || field.kind === 'percent' ? 'decimal' : 'numeric'}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />}
    {error && <p id={`${id}-error`} className="error">入力エラー: {error}</p>}
  </div>;
}
