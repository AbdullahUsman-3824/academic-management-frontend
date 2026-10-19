import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  academicsApi,
  yearsApi,
  sessionsApi,
  batchesApi,
  sectionsApi,
  progressionApi,
} from "../api/academics.api";
import type {
  AcademicYearStatus,
  AcademicSessionStatus,
  BatchStatus,
  UpdateAcademicYearDto,
  UpdateAcademicSessionDto,
  UpdateBatchDto,
  CreateSectionDto,
  UpdateSectionDto,
  MoveStudentsSectionDto,
  ImplementProgressionDto,
} from "../types/academics.types";

export const academicKeys = {
  all: ["academics"] as const,
  overview: () => [...academicKeys.all, "overview"] as const,
  years: (status?: string) => [...academicKeys.all, "years", status] as const,
  sessions: (params?: { status?: string; academicYearId?: string }) =>
    [...academicKeys.all, "sessions", params] as const,
  batches: (status?: string) =>
    [...academicKeys.all, "batches", status] as const,
  sections: (batchId: string) =>
    [...academicKeys.all, "sections", batchId] as const,
  progressionPreview: (academicSessionId?: string) =>
    [...academicKeys.all, "progression-preview", academicSessionId] as const,
};

// ── Overview / Setup ──────────────────────────────────────────────────────────

export function useAcademicOverview() {
  return useQuery({
    queryKey: academicKeys.overview(),
    queryFn: () => academicsApi.overview(),
  });
}

export function useSetupAcademic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: academicsApi.setup,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

// ── Years ─────────────────────────────────────────────────────────────────────

export function useAcademicYears(status?: AcademicYearStatus | "all" | string) {
  const s = status === "all" ? undefined : status;
  return useQuery({
    queryKey: academicKeys.years(s),
    queryFn: () => yearsApi.list(s as AcademicYearStatus | undefined),
  });
}
export const useYears = useAcademicYears;

export function useYear(id: string | null) {
  return useQuery({
    queryKey: [...academicKeys.all, "year", id],
    queryFn: () => yearsApi.get(id!),
    enabled: !!id,
  });
}

export function useUpdateYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAcademicYearDto }) =>
      yearsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export function useAcademicSessions(params?: {
  status?: AcademicSessionStatus | "all" | string;
  academicYearId?: string | "all";
}) {
  const status = params?.status === "all" ? undefined : params?.status;
  const academicYearId =
    params?.academicYearId === "all" ? undefined : params?.academicYearId;
  return useQuery({
    queryKey: academicKeys.sessions({ status, academicYearId }),
    queryFn: () =>
      sessionsApi.list({
        status: status as AcademicSessionStatus | undefined,
        academicYearId,
      }),
  });
}
export const useSessions = useAcademicSessions;

export function useSession(id: string | null) {
  return useQuery({
    queryKey: [...academicKeys.all, "session", id],
    queryFn: () => sessionsApi.get(id!),
    enabled: !!id,
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAcademicSessionDto }) =>
      sessionsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

export function useActivateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.activate,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.complete,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

// ── Batches ───────────────────────────────────────────────────────────────────

export function useBatches(status?: BatchStatus | "all" | string) {
  const s = status === "all" ? undefined : status;
  return useQuery({
    queryKey: academicKeys.batches(s),
    queryFn: () => batchesApi.list(s as BatchStatus | undefined),
  });
}

export function useBatch(id: string | null) {
  return useQuery({
    queryKey: [...academicKeys.all, "batch", id],
    queryFn: () => batchesApi.get(id!),
    enabled: !!id,
  });
}

export function useUpdateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBatchDto }) =>
      batchesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

export function useActivateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: batchesApi.activate,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

// ── Sections (real backend: /academics/batches/:batchId/sections) ────────────

export function useSections(batchId: string | null) {
  return useQuery({
    queryKey: academicKeys.sections(batchId ?? ""),
    queryFn: () => sectionsApi.list(batchId!),
    enabled: !!batchId,
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      dto,
    }: {
      batchId: string;
      dto: CreateSectionDto;
    }) => sectionsApi.create(batchId, dto),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: academicKeys.sections(vars.batchId) });
      qc.invalidateQueries({ queryKey: academicKeys.all }); // batch section count
    },
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      sectionId,
      dto,
    }: {
      batchId: string;
      sectionId: string;
      dto: UpdateSectionDto;
    }) => sectionsApi.update(batchId, sectionId, dto),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: academicKeys.sections(vars.batchId) }),
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      sectionId,
    }: {
      batchId: string;
      sectionId: string;
    }) => sectionsApi.remove(batchId, sectionId),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: academicKeys.sections(vars.batchId) });
      qc.invalidateQueries({ queryKey: academicKeys.all });
    },
  });
}

export function useMoveStudentsSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      dto,
    }: {
      batchId: string;
      dto: MoveStudentsSectionDto;
    }) => sectionsApi.moveStudents(batchId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

// ── Progression (real backend: preview + implement, nothing else) ────────────

export function useProgressionPreview(
  academicSessionId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: academicKeys.progressionPreview(academicSessionId),
    queryFn: () => progressionApi.getPreview(academicSessionId),
    enabled,
  });
}

export function useImplementProgression() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ImplementProgressionDto) => progressionApi.implement(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

// ── Enrollment-form lookups (used by Register Student) ────────────────────────

export function useEnrollmentSections(batchId: string | null) {
  return useQuery({
    queryKey: ["enrollment-sections", batchId],
    queryFn: () => sectionsApi.list(batchId!),
    enabled: !!batchId,
  });
}

export function useAcademicSessionsList(enabled: boolean = true) {
  return useQuery({
    queryKey: ["enrollment-academic-sessions"],
    queryFn: () => sessionsApi.options(),
    enabled,
  });
}
