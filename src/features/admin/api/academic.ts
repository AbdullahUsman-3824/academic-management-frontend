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
