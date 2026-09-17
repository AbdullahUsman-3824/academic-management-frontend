import apiClient from "../../../api/client";

// ── Types ───────────────────────────────────────────────────────────────────

export type StudentStatus = "active" | "inactive" | "graduated";
export type Gender = "male" | "female" | "other";

export interface BatchRef {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  userId: string;
  username: string;
  batch: BatchRef;
  stdRegNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  email: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  cnic: string | null;
  profileImageUrl: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  guardianName: string | null;
  guardianRelation: string | null;
  guardianPhone: string | null;
  guardianCnic: string | null;
  admissionDate: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned by GET /api/students (list — omits heavy fields) */
export interface StudentListItem {
  id: string;
  userId: string;
  username: string;
  stdRegNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: Gender | null;
  batch: BatchRef;
  status: StudentStatus;
  admissionDate: string;
}

export interface StudentListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentListResponse {
  success: boolean;
  data: StudentListItem[];
  meta: StudentListMeta;
}

export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentStatus;
  batchId?: string;
}

export interface CreateStudentDto {
  batchId: string;
  stdRegNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  cnic?: string | null;
  profileImageUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  guardianName?: string | null;
  guardianRelation?: string | null;
  guardianPhone?: string | null;
  guardianCnic?: string | null;
  admissionDate?: string | null;
}

export interface UpdateStudentDto {
  batchId?: string;
  firstName?: string;
  middleName?: string | null;
  lastName?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  cnic?: string | null;
  profileImageUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  guardianName?: string | null;
  guardianRelation?: string | null;
  guardianPhone?: string | null;
  guardianCnic?: string | null;
  admissionDate?: string | null;
}

export interface UpdateStudentStatusDto {
  status: StudentStatus;
}

export interface BulkEnrollmentError {
  row: number;
  stdRegNumber: string | null;
  errors: string[];
}

export interface BulkEnrollmentResult {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: BulkEnrollmentError[];
}

// ── Students ─────────────────────────────────────────────────────────────────

export async function getStudents(
  params?: StudentListParams,
): Promise<StudentListResponse> {
  const { data } = await apiClient.get<StudentListResponse>("/students", {
    params,
  });
  return data;
}

export async function getStudent(id: string): Promise<Student> {
  const { data } = await apiClient.get<{ success: boolean; data: Student }>(
    `/students/${id}`,
  );
  return data.data;
}

export async function createStudent(dto: CreateStudentDto): Promise<Student> {
  const { data } = await apiClient.post<{ success: boolean; data: Student }>(
    "/students",
    dto,
  );
  return data.data;
}

export async function updateStudent(
  id: string,
  dto: UpdateStudentDto,
): Promise<Student> {
  const { data } = await apiClient.patch<{ success: boolean; data: Student }>(
    `/students/${id}`,
    dto,
  );
  return data.data;
}

export async function updateStudentStatus(
  id: string,
  dto: UpdateStudentStatusDto,
): Promise<{ id: string; status: StudentStatus; updatedAt: string }> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: { id: string; status: StudentStatus; updatedAt: string };
  }>(`/students/${id}/status`, dto);
  return data.data;
}

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

export async function downloadBulkTemplate(): Promise<Blob> {
  const { data } = await apiClient.get<Blob>("/students/bulk/template", {
    responseType: "blob",
  });
  return data;
}
