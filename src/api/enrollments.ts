import apiClient from './client'

export type EnrollmentStatus =
  | 'enrolled'
  | 'dropped'
  | 'completed'
  | 'failed'
  | 'reappear'

export interface Enrollment {
  id: string
  studentAcademicRecordId: string
  courseId: string
  status: EnrollmentStatus
  isExtra: boolean
  enrolledAt: string
  droppedAt?: string | null
  course?: {
    id: string
    code: string
    name: string
    creditHours: number
    courseType?: string
  }
  studentAcademicRecord?: {
    id: string
    currentSemester: number
    academicYear: number
    student?: {
      id: string
      studentNumber: string
      firstName: string
      middleName?: string | null
      lastName: string
    }
  }
}

export interface EnrollmentStats {
  studentAcademicRecordId: string
  totalEnrollments: number
  statusBreakdown: Record<EnrollmentStatus, number>
  totalCreditHours: number
  extraCourses: number
}

export interface CreateEnrollmentPayload {
  studentAcademicRecordId: string
  courseId: string
  isExtra?: boolean
}

export interface BulkEnrollPayload {
  studentAcademicRecordId: string
  courseIds: string[]
  isExtra?: boolean
}

export interface BulkEnrollResult {
  success: Enrollment[]
  errors: Array<{
    courseId: string
    error: string
  }>
  summary: {
    total: number
    created: number
    failed: number
  }
}

export interface UpdateEnrollmentStatusPayload {
  status: EnrollmentStatus
}

type ApiList = {
  success: boolean
  data: Enrollment[]
}

type ApiOne = {
  success: boolean
  data: Enrollment
}

type ApiBulk = {
  success: boolean
  data: BulkEnrollResult
}

type ApiStats = {
  success: boolean
  data: EnrollmentStats
}

export async function getEnrollments(params?: {
  studentId?: string
  studentAcademicRecordId?: string
  courseId?: string
  status?: EnrollmentStatus
}): Promise<Enrollment[]> {
  const { data } = await apiClient.get<ApiList>('/enrollments', { params })
  return data.data
}

export async function getEnrollment(id: string): Promise<Enrollment> {
  const { data } = await apiClient.get<ApiOne>(`/enrollments/${id}`)
  return data.data
}

export async function getEnrollmentsByStudent(
  studentId: string,
  academicSessionId?: string,
): Promise<Enrollment[]> {
  const { data } = await apiClient.get<ApiList>(
    `/enrollments/student/${studentId}`,
    {
      params: academicSessionId ? { academicSessionId } : undefined,
    },
  )
  return data.data
}

export async function getEnrollmentStats(
  studentAcademicRecordId: string,
): Promise<EnrollmentStats> {
  const { data } = await apiClient.get<ApiStats>(
    `/enrollments/stats/${studentAcademicRecordId}`,
  )
  return data.data
}

export async function createEnrollment(
  payload: CreateEnrollmentPayload,
): Promise<Enrollment> {
  const { data } = await apiClient.post<ApiOne>('/enrollments', payload)
  return data.data
}

export async function bulkEnroll(
  payload: BulkEnrollPayload,
): Promise<BulkEnrollResult> {
  const { data } = await apiClient.post<ApiBulk>('/enrollments/bulk', payload)
  return data.data
}

export async function updateEnrollmentStatus(
  id: string,
  payload: UpdateEnrollmentStatusPayload,
): Promise<Enrollment> {
  const { data } = await apiClient.patch<ApiOne>(
    `/enrollments/${id}/status`,
    payload,
  )
  return data.data
}

export async function dropEnrollment(id: string): Promise<Enrollment> {
  const { data } = await apiClient.patch<ApiOne>(`/enrollments/${id}/drop`)
  return data.data
}

export async function deleteEnrollment(id: string): Promise<void> {
  await apiClient.delete(`/enrollments/${id}`)
}
