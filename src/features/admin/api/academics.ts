import apiClient from "../../../api/client";

// ── Enums ───────────────────────────────────────────────────────────────────

export enum AcademicYearStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  COMPLETED = "COMPLETED",
}

export enum AcademicSessionStatus {
  UPCOMING = "UPCOMING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum BatchStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  academicSessions?: AcademicSession[];
}

export interface AcademicSession {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicSessionStatus;
  progressed?: boolean;
  academicYear?: { id: string; name: string };
}

// Matches the backend's actual MappedBatchResponse — NOT a stored
// startDate/endDate, they're derived (entryYear.startDate → +programDuration years).
export interface Batch {
  id: string;
  name: string;
  entryYearId: string;
  startDate: string;
  endDate: string;
  status: BatchStatus;
  programDuration?: number;
  sectionCapacity?: number;
  counts?: {
    students: number;
    sections: number;
  };
}

export interface AcademicOverview {
  currentYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  currentSession: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  statistics: {
    academicYears: number;
    activeBatches: number;
  };
}

export interface AcademicSetupPayload {
  year: { name: string; startDate: string; endDate: string };
  sessions: Array<{ name: string; startDate: string; endDate: string }>;
}

export interface UpdateAcademicYearDto {
  name?: string;
  startDate?: string;
  endDate?: string;
}

// NOTE: the backend's update() accepts status too, but it skips the
// "only one ACTIVE session per year" safety check that /activate enforces.
// Don't expose a raw status field in the UI — use activateSession/completeSession.
export interface UpdateAcademicSessionDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  academicYearId?: string;
}

// Matches the real UpdateBatchDto exactly — no startDate/endDate (backend
// derives them), has entryYearId/programDuration/sectionCapacity instead.
export interface UpdateBatchDto {
  name?: string;
  entryYearId?: string;
  programDuration?: number;
  sectionCapacity?: number;
  status?: BatchStatus;
}

// ── Sections ────────────────────────────────────────────────────────────────
// Real routes: /academics/batches/:batchId/sections[...]

export interface SectionItem {
  id: string;
  name: string;
}

export interface CreateSectionDto {
  name?: string; // optional — backend auto-assigns next free letter (A, B, C…)
}

export interface UpdateSectionDto {
  name?: string;
}

export interface MoveStudentsSectionDto {
  studentIds: string[];
  // NOTE: backend's moveStudents REJECTS null with a 400 — there is no
  // "Auto" option here (unlike student registration's sectionId). An
  // explicit target section is always required.
  targetSectionId: string;
}

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
// Real routes: GET /academics/progression/preview, POST /academics/progression/implement
// This IS the full backend surface — there is no check/start/with-record/etc.

export interface ProgressionStudentPreview {
  studentId: string;
  regNumber: string;
  fullName: string;
  currentSectionId: string | null;
  currentSectionName: string | null;
}

export interface ProgressionTransitionPreview {
  fromSemester: number;
  fromSemesterId: string | null;
  fromSemesterName: string | null;
  toSemester: number;
  toSemesterId: string | null;
  toSemesterName: string | null;
  isFinal: boolean;
  missingTargetSemester: boolean;
  count: number;
  students: ProgressionStudentPreview[];
}

export interface ProgressionBatchPreview {
  batchId: string;
  batchName: string;
  totalStudents: number;
  transitions: ProgressionTransitionPreview[];
}

export interface ProgressionPreviewResponse {
  academicSessionId: string;
  academicSessionName: string;
  totalStudents: number;
  totalBatches: number;
  batches: ProgressionBatchPreview[];
}

export interface ProgressionAdjustment {
  studentId: string;
  targetSemester: number;
}

export interface ProgressionExcludedGroup {
  batchId: string;
  fromSemester: number;
  toSemester: number;
}

export interface ImplementProgressionDto {
  academicSessionId: string;
  adjustments?: ProgressionAdjustment[];
  excludedStudentIds?: string[];
  excludedGroups?: ProgressionExcludedGroup[];
}

export interface ImplementProgressionResponse {
  message: string;
  createdCount: number;
  skippedCount: number;
  academicSessionId: string;
}

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

// ── Enrollment-form lookups (used by Register Student) ──────────────────────

export async function getSectionsForBatch(
  batchId: string,
): Promise<{ id: string; name: string }[]> {
  const { data } = await apiClient.get<{ id: string; name: string }[]>(
    `/academics/batches/${batchId}/sections`,
  );
  return data;
}

export async function getAcademicSessionsList(): Promise<
  { id: string; name: string }[]
> {
  const { data } = await apiClient.get<{ id: string; name: string }[]>(
    "/academics/sessions/list",
  );
  return data;
}

// ── Overview ────────────────────────────────────────────────────────────────

export async function getOverview(): Promise<AcademicOverview> {
  const { data } = await apiClient.get<AcademicOverview>("/academics/overview");
  return data;
}

export async function setupAcademic(payload: AcademicSetupPayload) {
  const { data } = await apiClient.post("/academics/setup", payload);
  return data;
}

// ── Years ───────────────────────────────────────────────────────────────────
// NOTE: no delete route exists on the backend (service has a remove() method
// but the controller never calls it) — don't add a delete button for years.

export async function getYears(
  status?: AcademicYearStatus,
): Promise<AcademicYear[]> {
  const { data } = await apiClient.get<AcademicYear[]>("/academics/years", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function getYear(id: string): Promise<AcademicYear> {
  const { data } = await apiClient.get<AcademicYear>(`/academics/years/${id}`);
  return data;
}

export async function updateYear(id: string, dto: UpdateAcademicYearDto) {
  const { data } = await apiClient.patch(`/academics/years/${id}`, dto);
  return data;
}

export async function createYear(payload: {
  name: string;
  startDate: string;
  endDate: string;
}) {
  const { data } = await apiClient.post("/academics/years", payload);
  return data;
}

// ── Sessions ────────────────────────────────────────────────────────────────
// NOTE: no delete route either. Status changes only via activate()/complete().

export async function getSessions(params?: {
  status?: AcademicSessionStatus;
  academicYearId?: string;
}): Promise<AcademicSession[]> {
  const { data } = await apiClient.get<AcademicSession[]>(
    "/academics/sessions",
    { params },
  );
  return data;
}

export async function getSession(id: string): Promise<AcademicSession> {
  const { data } = await apiClient.get<AcademicSession>(
    `/academics/sessions/${id}`,
  );
  return data;
}

export async function updateSession(id: string, dto: UpdateAcademicSessionDto) {
  const { data } = await apiClient.patch(`/academics/sessions/${id}`, dto);
  return data;
}

export async function activateSession(id: string) {
  const { data } = await apiClient.post(`/academics/sessions/${id}/activate`);
  return data;
}

export async function completeSession(id: string) {
  const { data } = await apiClient.post(`/academics/sessions/${id}/complete`);
  return data;
}

export async function createSession(payload: {
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
}) {
  const { data } = await apiClient.post("/academics/sessions", payload);
  return data;
}

// ── Batches ─────────────────────────────────────────────────────────────────
// NOTE: no standalone create or delete route — batches are created via
// /academics/setup. Status changes should go through activate(), not a raw
// status field, since activate() has transition guards the generic PATCH skips.

export async function getBatches(status?: BatchStatus): Promise<Batch[]> {
  const { data } = await apiClient.get<Batch[]>("/academics/batches", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function getBatch(id: string): Promise<Batch> {
  const { data } = await apiClient.get<Batch>(`/academics/batches/${id}`);
  return data;
}

export async function updateBatch(id: string, dto: UpdateBatchDto) {
  const { data } = await apiClient.patch(`/academics/batches/${id}`, dto);
  return data;
}

export async function activateBatch(id: string) {
  const { data } = await apiClient.post(`/academics/batches/${id}/activate`);
  return data;
}
