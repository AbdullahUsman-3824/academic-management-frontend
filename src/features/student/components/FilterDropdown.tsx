import type { HTMLAttributes, Key } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

/* ---------- Types ---------- */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: FilterOption[];
  onChange: (value: FilterOption[]) => void;
  multiple?: boolean;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

/* ---------- Styling ---------- */

const inputSx = {
  minWidth: 0,

  "& .MuiOutlinedInput-root": {
    height: 36,
    minWidth: 0,
    flexWrap: "nowrap",
    overflow: "hidden",
    padding: "0 32px 0 8px !important",
    borderRadius: "6px",
    fontSize: 13,
    color: "#334155",

    "& fieldset": {
      borderColor: "#cbd5e1",
    },

    "&:hover fieldset": {
      borderColor: "#94a3b8",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#2563eb",
      borderWidth: "1px",
    },
  },

  "& .MuiAutocomplete-inputRoot": {
    flexWrap: "nowrap",
    overflow: "hidden",
  },

  "& .MuiAutocomplete-input": {
    minWidth: "0 !important",
    width: "0 !important",
    flexGrow: 1,
    padding: "0 !important",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  "& .MuiAutocomplete-endAdornment": {
    right: 4,
    top: "50%",
    transform: "translateY(-50%)",
  },

  "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator": {
    padding: "3px",
    color: "#64748b",
    backgroundColor: "transparent",
    borderRadius: "4px",

    "&:hover": {
      backgroundColor: "#f1f5f9",
    },
  },

  "& .MuiAutocomplete-tag": {
    display: "none",
  },

  "& input::placeholder": {
    color: "#94a3b8",
    opacity: 1,
  },
};

const paperSx = {
  mt: 0.5,
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  boxShadow: "0 8px 24px rgba(15,23,42,.10)",

  "& .MuiAutocomplete-option": {
    minHeight: 34,
    fontSize: 13,
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },
};

/* ---------- Component ---------- */

export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
  multiple = true,
}: FilterDropdownProps) {
  function renderOption(
    props: HTMLAttributes<HTMLLIElement> & { key?: Key },
    option: FilterOption,
    selected: boolean,
  ) {
    const { key, ...optionProps } = props;

    return (
      <li key={key} {...optionProps}>
        {multiple && (
          <Checkbox
            size="small"
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
            className="mr-1.5 -ml-0.5 p-0.5"
          />
        )}

        <span className="min-w-0 truncate text-[13px]">{option.label}</span>
      </li>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>

      {multiple ? (
        <Autocomplete<FilterOption, true, false, false>
          multiple
          size="small"
          options={options}
          value={value}
          onChange={(_, next) => onChange(next)}
          disableCloseOnSelect
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, val) => option.value === val.value}
          renderValue={(selected) => (
            <span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {selected.length === 0
                ? ""
                : selected.length === 1
                  ? selected[0].label
                  : `${selected.length} selected`}
            </span>
          )}
          renderOption={(props, option, state) =>
            renderOption(props, option, state.selected)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={value.length === 0 ? "All" : ""}
              sx={inputSx}
            />
          )}
          slotProps={{
            paper: { sx: paperSx },
          }}
        />
      ) : (
        <Autocomplete<FilterOption, false, false, false>
          size="small"
          options={options}
          value={value[0] ?? null}
          onChange={(_, next) => onChange(next ? [next] : [])}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, val) => option.value === val.value}
          renderValue={(selected) => (
            <span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {selected?.label ?? ""}
            </span>
          )}
          renderOption={(props, option, state) =>
            renderOption(props, option, state.selected)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={value.length === 0 ? "All" : ""}
              sx={inputSx}
            />
          )}
          slotProps={{
            paper: { sx: paperSx },
          }}
        />
      )}
    </div>
  );
}
