import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/students";
import type {
  StudentListParams,
  StudentStatus,
  CreateStudentDto,
  UpdateStudentDto,
  UpdateStudentStatusDto,
} from "../api/students";

// ── Query Key Factory ────────────────────────────────────────────────────────

export const studentKeys = {
  all: ["students"] as const,
  list: (params?: StudentListParams) =>
    [...studentKeys.all, "list", params ?? {}] as const,
  detail: (id: string) => [...studentKeys.all, "detail", id] as const,
};

// ── Query Hooks ──────────────────────────────────────────────────────────────

export function useStudents(params?: StudentListParams) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => api.getStudents(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useStudent(id: string | null) {
  return useQuery({
    queryKey: studentKeys.detail(id ?? ""),
    queryFn: () => api.getStudent(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ── Mutation Hooks ───────────────────────────────────────────────────────────

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStudentDto) => api.createStudent(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentDto }) =>
      api.updateStudent(id, dto),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: studentKeys.list() });
      qc.setQueryData(studentKeys.detail(data.id), data);
    },
  });
}

export function useUpdateStudentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentStatusDto }) =>
      api.updateStudentStatus(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: studentKeys.list() });
      qc.invalidateQueries({ queryKey: studentKeys.detail(id) });
    },
  });
}

export function useBulkEnrollStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, dryRun }: { file: File; dryRun?: boolean }) =>
      api.bulkEnrollStudents(file, dryRun),
    onSuccess: (_data, { dryRun }) => {
      // Only invalidate student list when it's a real (non-dry) run
      if (!dryRun) {
        qc.invalidateQueries({ queryKey: studentKeys.all });
      }
    },
  });
}

export function useDownloadBulkTemplate() {
  return useMutation({
    mutationFn: () => api.downloadBulkTemplate(),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "student_bulk_enrollment_template.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });
}

// ── Re-export status type for page use ───────────────────────────────────────
export type { StudentStatus };
