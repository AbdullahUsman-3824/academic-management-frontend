import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/faculty';
import type { FacultyStatus } from '../api/faculty';

export const facultyKeys = {
  all: ['faculty'] as const,
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: FacultyStatus;
    designation?: string;
  }) => [...facultyKeys.all, 'list', params] as const,
  detail: (id: string) => [...facultyKeys.all, 'detail', id] as const,
  teachingLoad: (id: string, sessionId?: string) =>
    [...facultyKeys.all, 'teaching-load', id, sessionId] as const,
};

export function useFaculty(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: FacultyStatus;
  designation?: string;
}, enabled: boolean = true) {
  return useQuery({
    queryKey: facultyKeys.list(params),
    queryFn: () => api.getFaculty(params),
    enabled, // Only fetch when enabled
  });
}

export function useFacultyById(id: string | null) {
  return useQuery({
    queryKey: facultyKeys.detail(id ?? ''),
    queryFn: () => api.getFacultyById(id!),
    enabled: !!id,
  });
}

export function useFacultyTeachingLoad(
  id: string | null,
  academicSessionId?: string,
) {
  return useQuery({
    queryKey: facultyKeys.teachingLoad(id ?? '', academicSessionId),
    queryFn: () => api.getFacultyTeachingLoad(id!, academicSessionId),
    enabled: !!id,
  });
}

export function useCreateFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createFaculty,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facultyKeys.all });
    },
  });
}

export function useUpdateFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: api.UpdateFacultyPayload }) =>
      api.updateFaculty(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facultyKeys.all });
    },
  });
}

export function useUpdateFacultyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FacultyStatus }) =>
      api.updateFacultyStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facultyKeys.all });
    },
  });
}

export function useDeleteFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteFaculty,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facultyKeys.all });
    },
  });
}

export type { FacultyStatus };
