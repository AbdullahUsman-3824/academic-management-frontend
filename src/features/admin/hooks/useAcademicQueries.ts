import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academicsApi } from '../../../api/academics'
import { sectionsApi } from '../../../api/academics'
import { progressionApi, createYear, createSession, setupAcademic } from '../api/academic' // adjust path

export function useProgressionCheck() {
  return useQuery({
    queryKey: ['progression-check'],
    queryFn: progressionApi.check,
  })
}

export function useStartProgression() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: progressionApi.start,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progression-check'] })
    },
  })
}

export function useProgressionPreview(progressionId: string | null) {
  return useQuery({
    queryKey: ['progression-preview', progressionId],
    queryFn: () => progressionApi.getPreview(progressionId!),
    enabled: !!progressionId,
  })
}
export const sectionKeys = {
  list: (batchId: string) => ['sections', batchId] as const,
  defaultStudents: (batchId: string) =>
    ['sections', batchId, 'default-students'] as const,
}

export function useSections(batchId: string | null) {
  return useQuery({
    queryKey: sectionKeys.list(batchId ?? ''),
    queryFn: () => sectionsApi.list(batchId!),
    enabled: !!batchId,
  })
}

export function useDefaultStudents(batchId: string | null) {
  return useQuery({
    queryKey: sectionKeys.defaultStudents(batchId ?? ''),
    queryFn: () => sectionsApi.studentsInDefault(batchId!),
    enabled: !!batchId,
  })
}

export function useAutoCreateSections() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      batchId,
      capacity,
    }: {
      batchId: string
      capacity?: number
    }) => sectionsApi.autoCreate(batchId, capacity),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: sectionKeys.list(vars.batchId) })
      qc.invalidateQueries({
        queryKey: sectionKeys.defaultStudents(vars.batchId),
      })
    },
  })
}

export function useResetSections() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (batchId: string) => sectionsApi.reset(batchId),
    onSuccess: (_data, batchId) => {
      qc.invalidateQueries({ queryKey: sectionKeys.list(batchId) })
      qc.invalidateQueries({
        queryKey: sectionKeys.defaultStudents(batchId),
      })
    },
  })
}

export function useDeleteSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      batchId,
      sectionId,
    }: {
      batchId: string
      sectionId: string
    }) => sectionsApi.deleteSection(batchId, sectionId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: sectionKeys.list(vars.batchId) })
      qc.invalidateQueries({
        queryKey: sectionKeys.defaultStudents(vars.batchId),
      })
    },
  })
}
export const academicKeys = {
  all: ['academics'] as const,
  overview: () => [...academicKeys.all, 'overview'] as const,
  years: (status?: string) => [...academicKeys.all, 'years', status] as const,
  sessions: (params?: { status?: string; academicYearId?: string }) =>
    [...academicKeys.all, 'sessions', params] as const,
  batches: (status?: string) => [...academicKeys.all, 'batches', status] as const,
  progressionCheck: () => [...academicKeys.all, 'progression-check'] as const,
}

export function useAcademicOverview() {
  return useQuery({
    queryKey: academicKeys.overview(),
    queryFn: academicsApi.getOverview,
  })
}

export function useAcademicYears(status?: string) {
  return useQuery({
    queryKey: academicKeys.years(status),
    queryFn: () => academicsApi.getYears(status),
  })
}

export function useAcademicSessions(params?: {
  status?: string
  academicYearId?: string
}) {
  return useQuery({
    queryKey: academicKeys.sessions(params),
    queryFn: () => academicsApi.getSessions(params),
  })
}

export function useBatches(status?: string) {
  return useQuery({
    queryKey: academicKeys.batches(status),
    queryFn: () => academicsApi.getBatches(status),
  })
}

// export function useProgressionCheck() {
//   return useQuery({
//     queryKey: academicKeys.progressionCheck(),
//     queryFn: academicsApi.checkProgression,
//   })
// }

export function useActivateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academicsApi.activateSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.all })
    },
  })
}

export function useCompleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academicsApi.completeSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.all })
    },
  })
}

export function useCreateYear() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createYear,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.all })
    },
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.all })
    },
  })
}

export function useSetupAcademic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: setupAcademic,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.all })
    },
  })
}

// export function useStartProgression() {
//   const qc = useQueryClient()
//   return useMutation({
//     mutationFn: academicsApi.startProgression,
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: academicKeys.progressionCheck() })
//     },
//   })
// }