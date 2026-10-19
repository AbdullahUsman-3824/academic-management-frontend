import apiClient from "../../../api/client";

import type {
  AdminStudentDetail,
  AdminStudentListResponse,
  CreateStudentDto,
  UpdateStudentDto,
  UpdateStudentStatusDto,
  CreateStudentResult,
  BulkEnrollmentResult,
} from "../types/student.types";
import type { StudentListParams } from "../../../types/student.types";

// ── List ──────────────────────────────────────────────────
export async function getStudents(
  params?: StudentListParams,
): Promise<AdminStudentListResponse> {
  const { data } = await apiClient.get<AdminStudentListResponse>("/students", {
    params,
  });
  return data;
}

// ── Detail ────────────────────────────────────────────────
export async function getStudent(id: string): Promise<AdminStudentDetail> {
  const { data } = await apiClient.get<
    AdminStudentDetail | { success?: boolean; data: AdminStudentDetail }
  >(`/students/${id}`);

  // supports both flat response and { data: {...} } wrapper
  return "data" in data && data.data ? data.data : (data as AdminStudentDetail);
}

// ── Create ────────────────────────────────────────────────
export async function createStudent(
  dto: CreateStudentDto,
): Promise<CreateStudentResult> {
  const { data } = await apiClient.post<{
    success: boolean;
    message: string;
    data: CreateStudentResult;
  }>("/students", dto);
  return data.data;
}

// ── Update ────────────────────────────────────────────────
export async function updateStudent(
  id: string,
  dto: UpdateStudentDto,
): Promise<void> {
  await apiClient.patch(`/students/${id}`, dto);
}

// ── Update Status ─────────────────────────────────────────
export async function updateStudentStatus(
  id: string,
  dto: UpdateStudentStatusDto,
): Promise<{ id: string; status: string; updatedAt: string }> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: { id: string; status: string; updatedAt: string };
  }>(`/students/${id}/status`, dto);
  return data.data;
}

// ── Bulk Enroll ───────────────────────────────────────────
export async function bulkEnrollStudents(
  file: File,
  dryRun?: boolean,
): Promise<BulkEnrollmentResult> {
  const form = new FormData();
  form.append("file", file);

  const { data } = await apiClient.post<{
    success: boolean;
    data: BulkEnrollmentResult;
  }>("/students/bulk", form, {
    headers: { "Content-Type": "multipart/form-data" },
    params: dryRun ? { dryRun: "true" } : undefined,
  });

  return data.data;
}

// ── Download Template ─────────────────────────────────────
export async function downloadBulkTemplate(): Promise<Blob> {
  const { data } = await apiClient.get<Blob>("/students/bulk/template", {
    responseType: "blob",
  });
  return data;
}
