import RefreshIcon from "@mui/icons-material/Refresh";

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
  meta?: React.ReactNode;
}

export function StatusFilterBar({ filters, onRefresh, meta }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 w-full">
      {meta && <div className="text-xs text-(--ink-soft)">{meta}</div>}

      <div className=" flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <label
            key={filter.id}
            className="flex items-center gap-2 text-sm text-(--ink-soft)"
          >
            <span>{filter.label}</span>

            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              aria-label={filter.label}
              className="rounded-md border border-(--line) bg-white px-3 py-1.5 text-sm text-(--ink) outline-none focus:border-(--green-800)"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh"
            title="Refresh"
            className="flex items-center gap-1.5 rounded-md border border-(--line) px-3 py-1.5 text-sm text-(--green-900) hover:bg-(--green-100)"
          >
            <RefreshIcon fontSize="small" />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
