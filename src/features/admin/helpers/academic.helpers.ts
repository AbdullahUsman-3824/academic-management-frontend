import type { CSSProperties } from "react";
import {
  AcademicYearStatus,
  AcademicSessionStatus,
  BatchStatus,
} from "../api/academics";

// ── Formatting ───────────────────────────────────────────────────────────────

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function toInputDate(value?: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function isValidRange(start: string, end: string) {
  return !!start && !!end && new Date(end) > new Date(start);
}

// ── Status → CSS class ───────────────────────────────────────────────────────

export const yearStatusClass: Record<AcademicYearStatus, string> = {
  [AcademicYearStatus.ACTIVE]: "active",
  [AcademicYearStatus.INACTIVE]: "inactive",
  [AcademicYearStatus.COMPLETED]: "ok",
};

export const sessionStatusClass: Record<AcademicSessionStatus, string> = {
  [AcademicSessionStatus.UPCOMING]: "upcoming",
  [AcademicSessionStatus.ACTIVE]: "active",
  [AcademicSessionStatus.COMPLETED]: "ok",
  [AcademicSessionStatus.CANCELLED]: "inactive",
};

export const batchStatusClass: Record<BatchStatus, string> = {
  [BatchStatus.ACTIVE]: "active",
  [BatchStatus.INACTIVE]: "inactive",
  [BatchStatus.COMPLETED]: "ok",
  [BatchStatus.CANCELLED]: "inactive",
};

export const inputStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 5,
  border: "1px solid var(--line)",
  fontSize: 13,
  width: "100%",
  maxWidth: 320,
};

// ── Form values (strings, because they come straight from <input>) ───────────

export interface YearFormValues {
  name: string;
  startDate: string;
  endDate: string;
}

export interface SessionFormValues {
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
}

export interface BatchFormValues {
  name: string;
  entryYearId: string;
  programDuration: string;
  sectionCapacity: string;
}

export const EMPTY_YEAR_FORM: YearFormValues = {
  name: "",
  startDate: "",
  endDate: "",
};

export const EMPTY_SESSION_FORM: SessionFormValues = {
  name: "",
  academicYearId: "",
  startDate: "",
  endDate: "",
};

export const EMPTY_BATCH_FORM: BatchFormValues = {
  name: "",
  entryYearId: "",
  programDuration: "",
  sectionCapacity: "",
};

// ── Validation (return an error message, or null when valid) ─────────────────

export function validateYearForm(v: YearFormValues): string | null {
  if (!v.name.trim()) return "Year name is required.";
  if (!isValidRange(v.startDate, v.endDate))
    return "End date must be after the start date.";
  return null;
}

export function validateSessionForm(v: SessionFormValues): string | null {
  if (!v.name.trim()) return "Session name is required.";
  if (!v.academicYearId) return "Please select an academic year.";
  if (!isValidRange(v.startDate, v.endDate))
    return "End date must be after the start date.";
  return null;
}

export function validateBatchForm(v: BatchFormValues): string | null {
  if (!v.name.trim()) return "Batch name is required.";
  if (!v.entryYearId) return "Please select an entry year.";
  const dur = Number(v.programDuration);
  if (!Number.isInteger(dur) || dur < 1)
    return "Program duration must be a whole number of years (1 or more).";
  const cap = Number(v.sectionCapacity);
  if (!Number.isInteger(cap) || cap < 1)
    return "Section capacity must be a whole number (1 or more).";
  return null;
}