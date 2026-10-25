// ── Enums ───────────────────────────────────────────────────────────────────

export enum AcademicYearStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  COMPLETED = "COMPLETED",
}

export enum AcademicSessionStatus {
  UPCOMING = "UPCOMING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum BatchStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ── Core models ─────────────────────────────────────────────────────────────

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

// Matches the backend's actual MappedBatchResponse. NOT a stored
// startDate/endDate, they're derived (entryYear.startDate, then + programDuration years).
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

// ── Setup and update DTOs ───────────────────────────────────────────────────

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
// Don't expose a raw status field in the UI, use activateSession/completeSession.
export interface UpdateAcademicSessionDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  academicYearId?: string;
}

// Matches the real UpdateBatchDto exactly. No startDate/endDate (backend
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
  name?: string; // optional, backend auto-assigns next free letter (A, B, C…)
}

export interface UpdateSectionDto {
  name?: string;
}

export interface MoveStudentsSectionDto {
  studentIds: string[];
  // NOTE: backend's moveStudents REJECTS null with a 400. There is no
  // "Auto" option here (unlike student registration's sectionId). An
  // explicit target section is always required.
  targetSectionId: string;
}

// ── Progression ─────────────────────────────────────────────────────────────
// Real routes: GET /academics/progression/preview, POST /academics/progression/implement
// This IS the full backend surface. There is no check/start/with-record/etc.

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
