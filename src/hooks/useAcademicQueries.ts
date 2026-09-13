import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/academic'
import type {
  AcademicYearStatus,
  AcademicSessionStatus,
  BatchStatus,
  AcademicSetupPayload,
  UpdateAcademicYearDto,
  UpdateAcademicSessionDto,
  UpdateBatchDto,
} from '../api/academic'

export const academicKeys = {
  all: ['academics'] as const,
  overview: () => [...academicKeys.all, 'overview'] as const,
  years: {
    all: () => [...academicKeys.all, 'years'] as const,
    list: (status?: AcademicYearStatus | 'all') =>
      [...academicKeys.years.all(), { status }] as const,
    detail: (id: string) => [...academicKeys.years.all(), id] as const,
  },
  sessions: {
    all: () => [...academicKeys.all, 'sessions'] as const,
    list: (filters?: {
      status?: AcademicSessionStatus | 'all'
      academicYearId?: string | 'all'
    }) => [...academicKeys.sessions.all(), filters ?? {}] as const,
    detail: (id: string) => [...academicKeys.sessions.all(), id] as const,
  },
  batches: {
    all: () => [...academicKeys.all, 'batches'] as const,
    list: (status?: BatchStatus | 'all') =>
      [...academicKeys.batches.all(), { status }] as const,
    detail: (id: string) => [...academicKeys.batches.all(), id] as const,
  },
}

// ── Overview ────────────────────────────────────────────────────────────────

export function useOverview() {
  return useQuery({
    queryKey: academicKeys.overview(),
    queryFn: api.getOverview,
    staleTime: 30_000,
  })
}

// ── Years ───────────────────────────────────────────────────────────────────

export function useYears(status?: AcademicYearStatus | 'all') {
  const filter = status === 'all' ? undefined : status
  return useQuery({
    queryKey: academicKeys.years.list(status),
    queryFn: () => api.getYears(filter),
    staleTime: 60_000,
  })
}

export function useYear(id: string | null) {
  return useQuery({
    queryKey: academicKeys.years.detail(id ?? ''),
    queryFn: () => api.getYear(id!),
    enabled: !!id,
  })
}

export function useUpdateYear() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAcademicYearDto }) =>
      api.updateYear(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.years.all() })
      qc.invalidateQueries({ queryKey: academicKeys.overview() })
    },
  })
}

// ── Sessions ────────────────────────────────────────────────────────────────

export function useSessions(filters?: {
  status?: AcademicSessionStatus | 'all'
  academicYearId?: string | 'all'
}) {
  const params = {
    status:
      filters?.status && filters.status !== 'all' ? filters.status : undefined,
    academicYearId:
      filters?.academicYearId && filters.academicYearId !== 'all'
        ? filters.academicYearId
        : undefined,
  }
  return useQuery({
    queryKey: academicKeys.sessions.list(filters),
    queryFn: () => api.getSessions(params),
    staleTime: 60_000,
  })
}

export function useSession(id: string | null) {
  return useQuery({
    queryKey: academicKeys.sessions.detail(id ?? ''),
    queryFn: () => api.getSession(id!),
    enabled: !!id,
  })
}

export function useUpdateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string
      dto: UpdateAcademicSessionDto
    }) => api.updateSession(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.sessions.all() })
      qc.invalidateQueries({ queryKey: academicKeys.years.all() })
      qc.invalidateQueries({ queryKey: academicKeys.overview() })
    },
  })
}

export function useActivateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.activateSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.sessions.all() })
      qc.invalidateQueries({ queryKey: academicKeys.overview() })
    },
  })
}

export function useCompleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.completeSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.sessions.all() })
      qc.invalidateQueries({ queryKey: academicKeys.overview() })
    },
  })
}

// ── Batches ─────────────────────────────────────────────────────────────────

export function useBatches(status?: BatchStatus | 'all') {
  const filter = status === 'all' ? undefined : status
  return useQuery({
    queryKey: academicKeys.batches.list(status),
    queryFn: () => api.getBatches(filter),
    staleTime: 60_000,
  })
}

export function useBatch(id: string | null) {
  return useQuery({
    queryKey: academicKeys.batches.detail(id ?? ''),
    queryFn: () => api.getBatch(id!),
    enabled: !!id,
  })
}

export function useUpdateBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBatchDto }) =>
      api.updateBatch(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.batches.all() })
      qc.invalidateQueries({ queryKey: academicKeys.overview() })
    },
  })
}

export function useActivateBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.activateBatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.batches.all() })
      qc.invalidateQueries({ queryKey: academicKeys.overview() })
    },
  })
}

// ── Setup ───────────────────────────────────────────────────────────────────

export function useSetupAcademic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AcademicSetupPayload) => api.setupAcademic(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.all })
    },
  })
}