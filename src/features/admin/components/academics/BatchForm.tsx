import type { FormEvent } from "react";
import { inputStyle } from "../../helpers/academic.helpers";
import type { BatchFormValues } from "../../helpers/academic.helpers";

interface Props {
  values: BatchFormValues;
  years: { id: string; name: string }[];
  onChange: (field: keyof BatchFormValues, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting?: boolean;
  error?: string | null;
  submitLabel?: string;
}

/**
 * Matches the backend UpdateBatchDto: name, entryYearId, programDuration,
 * sectionCapacity. Start/end dates are derived by the backend, so they are
 * NOT editable here. Status changes go through "Activate", not this form.
 */
export function BatchForm({
  values,
  years,
  onChange,
  onSubmit,
  onCancel,
  submitting = false,
  error,
  submitLabel = "Save",
}: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "crimson", marginBottom: 12 }}>{error}</p>}

      <div className="profile-fields">
        <div className="profile-field">
          <div className="profile-field__label">Name</div>
          <input
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div className="profile-field">
          <div className="profile-field__label">Entry Year</div>
          <select
            value={values.entryYearId}
            onChange={(e) => onChange("entryYearId", e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Select a year…</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>
        <div className="profile-field">
          <div className="profile-field__label">Program Duration (years)</div>
          <input
            type="number"
            min={1}
            step={1}
            value={values.programDuration}
            onChange={(e) => onChange("programDuration", e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div className="profile-field">
          <div className="profile-field__label">Section Capacity</div>
          <input
            type="number"
            min={1}
            step={1}
            value={values.sectionCapacity}
            onChange={(e) => onChange("sectionCapacity", e.target.value)}
            required
            style={inputStyle}
          />
        </div>
      </div>

      <div className="inline-actions" style={{ marginTop: 16 }}>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}