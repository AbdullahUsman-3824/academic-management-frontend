import apiClient from "../../../api/client";

// ── Types ───────────────────────────────────────────────────────────────────

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
  academicYear?: { id: string; name: string };
}

export interface Batch {
  id: string;
  name: string;
  startDate: string;
  endDate?: string | null;
  status: BatchStatus;
  _count?: { students: number };
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

export interface UpdateAcademicSessionDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: AcademicSessionStatus;
  academicYearId?: string;
}

export interface UpdateBatchDto {
  name?: string;
  startDate?: string;
  endDate?: string | null;
  status?: BatchStatus;
}

// ── Sections ─────────────────────────────────────────────

export interface SectionItem {
  id: string
  name: string
  studentCount: number
  status: string
}

export interface DefaultStudent {
  studentId: string
  regNumber: string
  fullName: string
}

// ── Progression Types ────────────────────────────────────

export interface ProgressionCheck {
  canStart: boolean
  reason?: string
  activeSession?: { id: string; name: string }
  existingProgression?: {
    id: string
    status: string
    currentStep: string | null
  }
}

export interface ProgressionStartResponse {
  id: string
  academicSessionId: string
  status: string
  currentStep: string | null
  isResumed: boolean
}

export interface ProgressionPreview {
  progressionId: string
  academicSessionId: string
  status: string
  totalWithRecord: number
  totalWithoutRecord: number
  batches: Array<{
    batchId: string
    batchName: string
    withRecordCount: number
    withoutRecordCount: number
    withRecordStudents: Array<{
      studentId: string
      regNumber: string
      fullName: string
      currentSemester: number | null
      targetSemester: number
      sectionName?: string
    }>
    withoutRecordStudents: Array<{
      studentId: string
      regNumber: string
      fullName: string
      currentSemester: null
      targetSemester: number
    }>
  }>
}

// ── Progression API ──────────────────────────────────────

export const progressionApi = {
  check: () =>
    apiClient
      .get<ProgressionCheck>('/academics/progression/check')
      .then((r) => r.data),

  start: (academicSessionId: string) =>
    apiClient
      .post<ProgressionStartResponse>('/academics/progression/start', {
        academicSessionId,
      })
      .then((r) => r.data),

  getPreview: (id: string) =>
    apiClient
      .get<ProgressionPreview>(`/academics/progression/${id}/preview`)
      .then((r) => r.data),

  confirmWithRecord: (
    id: string,
    body: { mode: 'auto' | 'manual'; adjustments?: any[] },
  ) =>
    apiClient
      .post(`/academics/progression/${id}/with-record/confirm`, body)
      .then((r) => r.data),

  assignSemester: (id: string, body: any) =>
    apiClient
      .post(`/academics/progression/${id}/without-record/semester`, body)
      .then((r) => r.data),

  assignSections: (id: string, body: any) =>
    apiClient
      .post(`/academics/progression/${id}/without-record/sections`, body)
      .then((r) => r.data),

  getFinalPreview: (id: string) =>
    apiClient
      .get(`/academics/progression/${id}/final-preview`)
      .then((r) => r.data),

  lock: (id: string) =>
    apiClient
      .post(`/academics/progression/${id}/lock`)
      .then((r) => r.data),
}

export const sectionsApi = {
  list: (batchId: string) =>
    apiClient
      .get<SectionItem[]>(`/batches/${batchId}/sections`)
      .then((r) => r.data),

  studentsInDefault: (batchId: string) =>
    apiClient
      .get<DefaultStudent[]>(
        `/batches/${batchId}/sections/students-in-default`,
      )
      .then((r) => r.data),

  autoCreate: (batchId: string, capacity?: number) =>
    apiClient
      .post(`/batches/${batchId}/sections/auto`, { capacity })
      .then((r) => r.data),

  reset: (batchId: string) =>
    apiClient
      .post(`/batches/${batchId}/sections/reset`)
      .then((r) => r.data),

  deleteSection: (batchId: string, sectionId: string) =>
    apiClient
      .delete(`/batches/${batchId}/sections/${sectionId}`)
      .then((r) => r.data),
}

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



// ── Sessions ────────────────────────────────────────────────────────────────

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

// ── Batches ─────────────────────────────────────────────────────────────────

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

export async function createYear(payload: {
  name: string
  startDate: string
  endDate: string
}) {
  const { data } = await apiClient.post('/academics/years', payload)
  return data
}

export async function createSession(payload: {
  academicYearId: string
  name: string
  startDate: string
  endDate: string
}) {
  const { data } = await apiClient.post('/academics/sessions', payload)
  return data
}


