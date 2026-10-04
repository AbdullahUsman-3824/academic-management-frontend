import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as academicApi from "../api/academic";
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
} from "../api/academic";

export const academicKeys = {
  all: ["academics"] as const,
  overview: () => [...academicKeys.all, "overview"] as const,
  years: (status?: string) => [...academicKeys.all, "years", status] as const,
  sessions: (params?: { status?: string; academicYearId?: string }) =>
    [...academicKeys.all, "sessions", params] as const,
  batches: (status?: string) => [...academicKeys.all, "batches", status] as const,
  sections: (batchId: string) => [...academicKeys.all, "sections", batchId] as const,
  progressionPreview: (academicSessionId?: string) =>
    [...academicKeys.all, "progression-preview", academicSessionId] as const,
};

// ── Overview / Setup ──────────────────────────────────────────────────────────

export function useAcademicOverview() {
  return useQuery({
    queryKey: academicKeys.overview(),
    queryFn: academicApi.getOverview,
  });
}

export function useSetupAcademic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: academicApi.setupAcademic,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

// ── Years ─────────────────────────────────────────────────────────────────────

export function useAcademicYears(status?: AcademicYearStatus | "all" | string) {
  const s = status === "all" ? undefined : status;
  return useQuery({
    queryKey: academicKeys.years(s),
    queryFn: () => academicApi.getYears(s as AcademicYearStatus | undefined),
  });
}
export const useYears = useAcademicYears;

export function useYear(id: string | null) {
  return useQuery({
    queryKey: [...academicKeys.all, "year", id],
    queryFn: () => academicApi.getYear(id!),
    enabled: !!id,
  });
}

export function useCreateYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: academicApi.createYear,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

export function useUpdateYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAcademicYearDto }) =>
      academicApi.updateYear(id, dto),
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
      academicApi.getSessions({
        status: status as AcademicSessionStatus | undefined,
        academicYearId,
      }),
  });
}
export const useSessions = useAcademicSessions;

export function useSession(id: string | null) {
  return useQuery({
    queryKey: [...academicKeys.all, "session", id],
    queryFn: () => academicApi.getSession(id!),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: academicApi.createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAcademicSessionDto }) =>
      academicApi.updateSession(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

export function useActivateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: academicApi.activateSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: academicApi.completeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

// ── Batches ───────────────────────────────────────────────────────────────────

export function useBatches(status?: BatchStatus | "all" | string) {
  const s = status === "all" ? undefined : status;
  return useQuery({
    queryKey: academicKeys.batches(s),
    queryFn: () => academicApi.getBatches(s as BatchStatus | undefined),
  });
}

export function useBatch(id: string | null) {
  return useQuery({
    queryKey: [...academicKeys.all, "batch", id],
    queryFn: () => academicApi.getBatch(id!),
    enabled: !!id,
  });
}

export function useUpdateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBatchDto }) =>
      academicApi.updateBatch(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

export function useActivateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: academicApi.activateBatch,
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

// ── Sections (real backend: /academics/batches/:batchId/sections) ────────────

export function useSections(batchId: string | null) {
  return useQuery({
    queryKey: academicKeys.sections(batchId ?? ""),
    queryFn: () => academicApi.sectionsApi.list(batchId!),
    enabled: !!batchId,
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, dto }: { batchId: string; dto: CreateSectionDto }) =>
      academicApi.sectionsApi.create(batchId, dto),
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
    }) => academicApi.sectionsApi.update(batchId, sectionId, dto),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: academicKeys.sections(vars.batchId) }),
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, sectionId }: { batchId: string; sectionId: string }) =>
      academicApi.sectionsApi.remove(batchId, sectionId),
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
    }) => academicApi.sectionsApi.moveStudents(batchId, dto),
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
    queryFn: () => academicApi.progressionApi.getPreview(academicSessionId),
    enabled,
  });
}

export function useImplementProgression() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ImplementProgressionDto) =>
      academicApi.progressionApi.implement(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.all }),
  });
}

// ── Enrollment-form lookups (used by Register Student) ────────────────────────

export function useEnrollmentSections(batchId: string | null) {
  return useQuery({
    queryKey: ["enrollment-sections", batchId],
    queryFn: () => academicApi.getSectionsForBatch(batchId!),
    enabled: !!batchId,
  });
}

export function useAcademicSessionsList(enabled: boolean = true) {
  return useQuery({
    queryKey: ["enrollment-academic-sessions"],
    queryFn: academicApi.getAcademicSessionsList,
    enabled,
  });
}