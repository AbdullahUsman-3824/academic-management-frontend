import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/enrollments'
import type { EnrollmentStatus } from '../api/enrollments'

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  list: (params?: {
    studentId?: string
    studentAcademicRecordId?: string
    courseId?: string
    status?: EnrollmentStatus
  }) => [...enrollmentKeys.all, 'list', params] as const,
  detail: (id: string) => [...enrollmentKeys.all, 'detail', id] as const,
  byStudent: (studentId: string, academicSessionId?: string) =>
    [...enrollmentKeys.all, 'student', studentId, academicSessionId] as const,
  stats: (studentAcademicRecordId: string) =>
    [...enrollmentKeys.all, 'stats', studentAcademicRecordId] as const,
}

export function useEnrollments(params?: {
  studentId?: string
  studentAcademicRecordId?: string
  courseId?: string
  status?: EnrollmentStatus
}) {
  return useQuery({
    queryKey: enrollmentKeys.list(params),
    queryFn: () => api.getEnrollments(params),
  })
}

export function useEnrollment(id: string | null) {
  return useQuery({
    queryKey: enrollmentKeys.detail(id ?? ''),
    queryFn: () => api.getEnrollment(id!),
    enabled: !!id,
  })
}

export function useEnrollmentsByStudent(
  studentId: string | null,
  academicSessionId?: string,
) {
  return useQuery({
    queryKey: enrollmentKeys.byStudent(studentId ?? '', academicSessionId),
    queryFn: () => api.getEnrollmentsByStudent(studentId!, academicSessionId),
    enabled: !!studentId,
  })
}

export function useEnrollmentStats(studentAcademicRecordId: string | null) {
  return useQuery({
    queryKey: enrollmentKeys.stats(studentAcademicRecordId ?? ''),
    queryFn: () => api.getEnrollmentStats(studentAcademicRecordId!),
    enabled: !!studentAcademicRecordId,
  })
}

export function useCreateEnrollment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createEnrollment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrollmentKeys.all })
    },
  })
}

export function useBulkEnroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.bulkEnroll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrollmentKeys.all })
    },
  })
}

export function useUpdateEnrollmentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: api.UpdateEnrollmentStatusPayload
    }) => api.updateEnrollmentStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrollmentKeys.all })
    },
  })
}

export function useDropEnrollment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.dropEnrollment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrollmentKeys.all })
    },
  })
}

export function useDeleteEnrollment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteEnrollment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrollmentKeys.all })
    },
  })
}
