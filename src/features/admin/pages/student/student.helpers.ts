import type { Student, StudentListItem } from "../../api/students";
import type { StudentStatus } from "../../hooks/useStudentQueries";
import type { StudentFormValues } from "./student.types";

// ── Display ──────────────────────────────────────────────────────────────────

export function toLabel(value: StudentStatus): string {
  if (value === "active") return "Active";
  if (value === "inactive") return "Inactive";
  return "Graduated";
}

export function getDisplayName(
  student: Pick<Student | StudentListItem, "firstName" | "middleName" | "lastName">,
): string {
  return [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");
}

// ── Form ─────────────────────────────────────────────────────────────────────

/** Converts an empty string to null; trims non-empty strings. */
export function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function toStudentFormValues(student: Student): StudentFormValues {
  return {
    batchId: student.batch.id,
    stdRegNumber: student.stdRegNumber,
    firstName: student.firstName,
    middleName: student.middleName ?? "",
    lastName: student.lastName ?? "",
    email: student.email ?? "",
    dateOfBirth: student.dateOfBirth ?? "",
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
    admissionDate: student.admissionDate,
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
