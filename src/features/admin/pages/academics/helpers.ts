import {
  AcademicYearStatus,
  AcademicSessionStatus,
  BatchStatus,
} from "../../api/academic";

export type Tab = "overview" | "years" | "sessions" | "batches" | "setup";

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

export const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 5,
  border: "1px solid var(--line)",
  fontSize: 13,
  width: "100%",
  maxWidth: 320,
};
