import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/allocations'

export const allocationKeys = {
  all: ['allocations'] as const,
  list: (params?: {
    facultyId?: string
    sectionId?: string
    semesterId?: string
    academicSessionId?: string
    status?: string
  }) => [...allocationKeys.all, 'list', params] as const,
  detail: (id: string) => [...allocationKeys.all, 'detail', id] as const,
  sectionSemester: (sectionId: string, semesterId: string) =>
    [...allocationKeys.all, 'section-semester', sectionId, semesterId] as const,
}

export function useAllocations(params?: {
  facultyId?: string
  sectionId?: string
  semesterId?: string
  academicSessionId?: string
  status?: string
}) {
  return useQuery({
    queryKey: allocationKeys.list(params),
    queryFn: () => api.getAllocations(params),
  })
}

export function useAllocation(id: string | null) {
  return useQuery({
    queryKey: allocationKeys.detail(id ?? ''),
    queryFn: () => api.getAllocation(id!),
    enabled: !!id,
  })
}

export function useAllocationsBySectionSemester(
  sectionId: string | null,
  semesterId: string | null,
) {
  return useQuery({
    queryKey: allocationKeys.sectionSemester(
      sectionId ?? '',
      semesterId ?? '',
    ),
    queryFn: () =>
      api.getAllocationsBySectionSemester(sectionId!, semesterId!),
    enabled: !!sectionId && !!semesterId,
  })
}

export function useCreateAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createAllocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: allocationKeys.all })
    },
  })
}

export function useBulkCreateAllocations() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.bulkCreateAllocations,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: allocationKeys.all })
    },
  })
}

export function useDeleteAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteAllocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: allocationKeys.all })
    },
  })
}
