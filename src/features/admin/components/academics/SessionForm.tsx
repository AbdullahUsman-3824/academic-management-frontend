import type { FormEvent } from "react";
import { inputStyle } from "../../helpers/academic.helpers";
import type { SessionFormValues } from "../../helpers/academic.helpers";

interface Props {
  values: SessionFormValues;
  years: { id: string; name: string }[];
  onChange: (field: keyof SessionFormValues, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting?: boolean;
  error?: string | null;
  submitLabel?: string;
  /** When true, start/end date and academic year inputs are disabled (e.g. status = active) */
  readonlyDates?: boolean;
}

export function SessionForm({
  values,
  years,
  onChange,
  onSubmit,
  onCancel,
  submitting = false,
  error,
  submitLabel = "Save",
  readonlyDates = false,
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
            placeholder="e.g. Fall 2026"
            required
            style={inputStyle}
          />
        </div>
        <div className="profile-field">
          <div className="profile-field__label">Academic Year</div>
          <select
            value={values.academicYearId}
            onChange={(e) => onChange("academicYearId", e.target.value)}
            required
            disabled={readonlyDates}
            style={inputStyle}
            className={"disabled:bg-gray-200 disabled:cursor-not-allowed"}
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
          <div className="profile-field__label">Start Date</div>
          <input
            type="date"
            value={values.startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
            required
            disabled={readonlyDates}
            style={inputStyle}
            className={"disabled:bg-gray-200 disabled:cursor-not-allowed"}
          />
        </div>
        <div className="profile-field">
          <div className="profile-field__label">End Date</div>
          <input
            type="date"
            value={values.endDate}
            onChange={(e) => onChange("endDate", e.target.value)}
            required
            disabled={readonlyDates}
            style={inputStyle}
            className={"disabled:bg-gray-200 disabled:cursor-not-allowed"}
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
