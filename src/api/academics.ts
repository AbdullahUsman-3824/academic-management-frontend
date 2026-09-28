import api from '..//api/client' // adjust path to your axios instance

// ── Types ────────────────────────────────────────────────

export interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
}

export interface AcademicSession {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  academicYearId: string
  academicYear?: AcademicYear
  progressed?: boolean
}

export interface Batch {
  id: string
  name: string
  entryYearId: string
  status: string
  sectionCapacity?: number
  programDuration?: number
  counts?: {
    students: number
    sections: number
  }
  startDate?: string
  endDate?: string
}

export interface AcademicOverview {
  currentYear: AcademicYear | null
  currentSession: AcademicSession | null
  statistics: {
    academicYears: number
    activeBatches: number
  }
}

export interface ProgressionCheck {
  canStart: boolean
  reason?: string
  activeSession?: {
    id: string
    name: string
  }
  existingProgression?: {
    id: string
    status: string
    currentStep: string | null
  }
}

export interface Section {
  id: string
  name: string
  batchId: string
  capacity: number
  studentCount: number
}

export interface StudentInDefault {
  id: string
  name: string
  rollNumber: string
}

// ── API calls ────────────────────────────────────────────

export const academicsApi = {
  // Overview
  getOverview: () =>
    api.get<AcademicOverview>('/academics/overview').then((r) => r.data),

  // Years
  getYears: (status?: string) =>
    api
      .get<AcademicYear[]>('/academics/years', { params: { status } })
      .then((r) => r.data),

  getYear: (id: string) =>
    api.get<AcademicYear>(`/academics/years/${id}`).then((r) => r.data),

  // Sessions
  getSessions: (params?: { status?: string; academicYearId?: string }) =>
    api
      .get<AcademicSession[]>('/academics/sessions', { params })
      .then((r) => r.data),

  getSession: (id: string) =>
    api.get<AcademicSession>(`/academics/sessions/${id}`).then((r) => r.data),

  activateSession: (id: string) =>
    api.post(`/academics/sessions/${id}/activate`).then((r) => r.data),

  completeSession: (id: string) =>
    api.post(`/academics/sessions/${id}/complete`).then((r) => r.data),

  // Batches
  getBatches: (status?: string) =>
    api
      .get<Batch[]>('/academics/batches', { params: { status } })
      .then((r) => r.data),

  getBatch: (id: string) =>
    api.get<Batch>(`/academics/batches/${id}`).then((r) => r.data),

  // Progression
  checkProgression: () =>
    api
      .get<ProgressionCheck>('/academics/progression/check')
      .then((r) => r.data),

  startProgression: (academicSessionId: string) =>
    api
      .post('/academics/progression/start', { academicSessionId })
      .then((r) => r.data),
}

export const sectionsApi = {
  // List sections for a batch
  list: (batchId: string) =>
    api
      .get<Section[]>(`/batches/${batchId}/sections`)
      .then((r) => r.data),

  // Get students in default section
  studentsInDefault: (batchId: string) =>
    api
      .get<StudentInDefault[]>(`/batches/${batchId}/sections/students-in-default`)
      .then((r) => r.data),

  // Auto create sections
  autoCreate: (batchId: string, capacity?: number) =>
    api
      .post(`/batches/${batchId}/sections/auto`, { capacity })
      .then((r) => r.data),

  // Manual assign sections
  manualAssign: (batchId: string, data: { sections: Array<{ name: string; studentIds: string[] }> }) =>
    api
      .post(`/batches/${batchId}/sections/manual`, data)
      .then((r) => r.data),

  // Move students between sections
  moveStudents: (batchId: string, data: { studentIds: string[]; targetSectionId: string }) =>
    api
      .post(`/batches/${batchId}/sections/move-students`, data)
      .then((r) => r.data),

  // Delete a section
  deleteSection: (batchId: string, sectionId: string) =>
    api
      .delete(`/batches/${batchId}/sections/${sectionId}`)
      .then((r) => r.data),

  // Reset all sections
  reset: (batchId: string) =>
    api
      .post(`/batches/${batchId}/sections/reset`)
      .then((r) => r.data),
}