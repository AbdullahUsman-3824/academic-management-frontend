interface FilterOption {
  value: string;
  label: string;
}

interface FilterDefinition {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface Props {
  filters: FilterDefinition[];
  onRefresh?: () => void;
  /** Extra content to render on the left side (e.g. a record count) */
  meta?: React.ReactNode;
}

/**
 * Reusable filter bar for data tables.
 * Renders labelled <select> dropdowns and an optional Refresh button.
 */
export function StatusFilterBar({ filters, onRefresh, meta }: Props) {
  return (
    <div className="filter-bar">
      {meta && <span className="filter-bar__meta">{meta}</span>}

      <div className="filter-bar__controls">
        {filters.map((f) => (
          <label key={f.id} className="filter-bar__filter">
            <span className="filter-bar__filter-label">{f.label}</span>
            <select
              className="filter-bar__select"
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              aria-label={f.label}
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        {onRefresh && (
          <button
            type="button"
            className="btn secondary filter-bar__refresh"
            onClick={onRefresh}
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
