import apiClient from "../../../api/client";
import {
  AcademicYearStatus,
  AcademicSessionStatus,
  BatchStatus,
} from "../types/academics.types";
import type {
  AcademicYear,
  AcademicSession,
  Batch,
  AcademicOverview,
  AcademicSetupPayload,
  UpdateAcademicYearDto,
  UpdateAcademicSessionDto,
  UpdateBatchDto,
  SectionItem,
  CreateSectionDto,
  UpdateSectionDto,
  MoveStudentsSectionDto,
  ProgressionPreviewResponse,
  ImplementProgressionDto,
  ImplementProgressionResponse,
} from "../types/academics.types";

// ── Overview and setup ──────────────────────────────────────────────────────

export const academicsApi = {
  overview: () =>
    apiClient.get<AcademicOverview>("/academics/overview").then((r) => r.data),

  setup: (payload: AcademicSetupPayload) =>
    apiClient.post("/academics/setup", payload).then((r) => r.data),
};

// ── Years ───────────────────────────────────────────────────────────────────

export const yearsApi = {
  list: (status?: AcademicYearStatus) =>
    apiClient
      .get<AcademicYear[]>("/academics/years", {
        params: status ? { status } : undefined,
      })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient.get<AcademicYear>(`/academics/years/${id}`).then((r) => r.data),

  update: (id: string, dto: UpdateAcademicYearDto) =>
    apiClient.patch(`/academics/years/${id}`, dto).then((r) => r.data),
};

// ── Sessions ────────────────────────────────────────────────────────────────

export const sessionsApi = {
  list: (params?: {
    status?: AcademicSessionStatus;
    academicYearId?: string;
  }) =>
    apiClient
      .get<AcademicSession[]>("/academics/sessions", { params })
      .then((r) => r.data),

  options: () =>
    apiClient
      .get<{ id: string; name: string }[]>("/academics/sessions/list")
      .then((r) => r.data),

  get: (id: string) =>
    apiClient
      .get<AcademicSession>(`/academics/sessions/${id}`)
      .then((r) => r.data),

  update: (id: string, dto: UpdateAcademicSessionDto) =>
    apiClient.patch(`/academics/sessions/${id}`, dto).then((r) => r.data),

  activate: (id: string) =>
    apiClient.post(`/academics/sessions/${id}/activate`).then((r) => r.data),

  complete: (id: string) =>
    apiClient.post(`/academics/sessions/${id}/complete`).then((r) => r.data),
};
export async function getSession(id: string): Promise<AcademicSession> {
  const { data } = await apiClient.get<AcademicSession>(
    `/academics/sessions/${id}`,
  );
  return data;
}

// ── Batches ─────────────────────────────────────────────────────────────────
export const batchesApi = {
  list: (status?: BatchStatus) =>
    apiClient
      .get<Batch[]>("/academics/batches", {
        params: status ? { status } : undefined,
      })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Batch>(`/academics/batches/${id}`).then((r) => r.data),

  update: (id: string, dto: UpdateBatchDto) =>
    apiClient.patch(`/academics/batches/${id}`, dto).then((r) => r.data),

  activate: (id: string) =>
    apiClient.post(`/academics/batches/${id}/activate`).then((r) => r.data),
};

// ── Sections ────────────────────────────────────────────────────────────────

export const sectionsApi = {
  list: (batchId: string) =>
    apiClient
      .get<SectionItem[]>(`/academics/batches/${batchId}/sections`)
      .then((r) => r.data),

  create: (batchId: string, dto: CreateSectionDto) =>
    apiClient
      .post<SectionItem>(`/academics/batches/${batchId}/sections`, dto)
      .then((r) => r.data),

  update: (batchId: string, sectionId: string, dto: UpdateSectionDto) =>
    apiClient
      .patch<SectionItem>(
        `/academics/batches/${batchId}/sections/${sectionId}`,
        dto,
      )
      .then((r) => r.data),

  remove: (batchId: string, sectionId: string) =>
    apiClient
      .delete<{
        message: string;
      }>(`/academics/batches/${batchId}/sections/${sectionId}`)
      .then((r) => r.data),

  moveStudents: (batchId: string, dto: MoveStudentsSectionDto) =>
    apiClient
      .post<{
        message: string;
        movedCount: number;
        targetSection: { id: string; name: string };
      }>(`/academics/batches/${batchId}/sections/move-students`, dto)
      .then((r) => r.data),
};

// ── Progression ─────────────────────────────────────────────────────────────

export const progressionApi = {
  getPreview: (academicSessionId?: string) =>
    apiClient
      .get<ProgressionPreviewResponse>("/academics/progression/preview", {
        params: academicSessionId ? { academicSessionId } : undefined,
      })
      .then((r) => r.data),

  implement: (dto: ImplementProgressionDto) =>
    apiClient
      .post<ImplementProgressionResponse>(
        "/academics/progression/implement",
        dto,
      )
      .then((r) => r.data),
};
