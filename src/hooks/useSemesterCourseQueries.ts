import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/semesterCourses'

export const semesterCourseKeys = {
  all: ['semester-courses'] as const,
  list: (params?: { semesterNumber?: number }) =>
    [...semesterCourseKeys.all, 'list', params] as const,
  bySemester: (semesterId: string) =>
    [...semesterCourseKeys.all, 'semester', semesterId] as const,
  bySemesterNumber: (semesterNumber: number) =>
    [...semesterCourseKeys.all, 'semester-number', semesterNumber] as const,
  semesters: () => ['semesters'] as const,
}

export function useSemesterCourses(params?: { semesterNumber?: number }) {
  return useQuery({
    queryKey: semesterCourseKeys.list(params),
    queryFn: () => api.getSemesterCourses(params),
  })
}

export function useSemesterCoursesBySemesterId(semesterId: string | null) {
  return useQuery({
    queryKey: semesterCourseKeys.bySemester(semesterId ?? ''),
    queryFn: () => api.getSemesterCoursesBySemesterId(semesterId!),
    enabled: !!semesterId,
  })
}

export function useSemesterCoursesBySemesterNumber(
  semesterNumber: number | null,
) {
  return useQuery({
    queryKey: semesterCourseKeys.bySemesterNumber(semesterNumber ?? 0),
    queryFn: () => api.getSemesterCoursesBySemesterNumber(semesterNumber!),
    enabled: semesterNumber !== null,
  })
}

export function useSemesters() {
  return useQuery({
    queryKey: semesterCourseKeys.semesters(),
    queryFn: api.getSemesters,
  })
}

export function useCreateSemesterCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createSemesterCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: semesterCourseKeys.all })
    },
  })
}

export function useBulkCreateSemesterCourses() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.bulkCreateSemesterCourses,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: semesterCourseKeys.all })
    },
  })
}

export function useDeleteSemesterCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteSemesterCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: semesterCourseKeys.all })
    },
  })
}
