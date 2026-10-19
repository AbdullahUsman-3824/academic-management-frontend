import type { StudentDetail } from "../api/students";
import type { StudentStatus } from "../hooks/useStudentQueries";
import type { StudentFormValues } from "../types/student.types";

// ── Display ──────────────────────────────────────────────────────────────────

export function toLabel(value: StudentStatus): string {
  if (value === "active") return "Active";
  if (value === "inactive") return "Inactive";
  return "Graduated";
}

export function capitalize(value: string | null | undefined): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "2026-09-12T00:00:00.000Z" → "Sep 12, 2026". Null/invalid → "—". */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC", // date-only values are stored as UTC midnight
  }).format(d);
}

/** "2026-09-12T08:30:00.000Z" → "Sep 12, 2026, 1:30 PM" (viewer's local time). */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

// ── Form ─────────────────────────────────────────────────────────────────────

/** Converts an empty string to null; trims non-empty strings. */
export function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/** ISO string → "yyyy-mm-dd" for <input type="date">. */
export function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

/** Best-effort split: first word = first, last word = last, rest = middle. */
export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", middleName: "", lastName: "" };
  }
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

export function toStudentFormValues(
  student: StudentDetail,
  batches: { id: string; name: string }[],
): StudentFormValues {
  const { firstName, middleName, lastName } = splitFullName(student.fullName);
  return {
    // Detail response only has batchName, so resolve the id from the batch list.
    batchId: batches.find((b) => b.name === student.batchName)?.id ?? "",
    sectionId: "",
    semesterNumber: "1",
    academicSessionId: "",
    stdRegNumber: student.stdRegNumber,
    firstName,
    middleName,
    lastName,
    email: student.email ?? "",
    dateOfBirth: toDateInput(student.dateOfBirth),
    gender: student.gender ?? "",
    cnic: student.cnic ?? "",
    profileImageUrl: student.profileImageUrl ?? "",
    phone: student.phone ?? "",
    address: student.address ?? "",
    city: student.city ?? "",
    guardianName: student.guardianName ?? "",
    guardianRelation: student.guardianRelation ?? "",
    guardianPhone: student.guardianPhone ?? "",
    guardianCnic: student.guardianCnic ?? "",
    admissionDate: toDateInput(student.admissionDate),
  };
}

// ── Error handling ────────────────────────────────────────────────────────────

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  const axiosError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return axiosError.response?.data?.message ?? axiosError.message ?? fallback;
}