import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  updateCourseStatus,
  type CourseStatus,
  type CreateCoursePayload,
  type UpdateCoursePayload,
} from '../api/courses'

export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: {
    page?: number
    search?: string
    status?: CourseStatus | 'all'
  }) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
}

export function useCourses(filters: {
  page?: number
  search?: string
  status?: CourseStatus | 'all'
}) {
  const status =
    filters.status && filters.status !== 'all' ? filters.status : undefined

  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: () =>
      getCourses({
        page: filters.page ?? 1,
        limit: 20,
        search: filters.search || undefined,
        status,
      }),
    staleTime: 30_000,
  })
}

export function useCourse(id: string | null) {
  return useQuery({
    queryKey: courseKeys.detail(id ?? ''),
    queryFn: () => getCourse(id!),
    enabled: !!id,
  })
}

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => createCourse(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.lists() })
    },
  })
}

export function useUpdateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateCoursePayload
    }) => updateCourse(id, payload),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: courseKeys.lists() })
      qc.invalidateQueries({ queryKey: courseKeys.detail(v.id) })
    },
  })
}

export function useUpdateCourseStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CourseStatus }) =>
      updateCourseStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.all })
    },
  })
}