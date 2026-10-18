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
      cnic?: string | null
      status?: string
      batchId?: string
      batch?: {
        id: string
        name: string
      }
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

export interface AvailableAllocation {
  id: string
  courseId: string
  course: {
    id: string
    code: string
    name: string
    creditHours: number
  }
  semesterNumber: number
  section: {
    id: string
    name: string
    batch: {
      id: string
      name: string
    }
  }
  faculty: {
    id: string
    employeeNumber: string
    name: string
  }
  displayText: string
}

export interface CreateEnrollmentPayload {
  studentAcademicRecordId?: string
  studentId?: string // Alternative to studentAcademicRecordId - backend will look up academic record
  courseId: string
  isExtra?: boolean
  allocationId?: string // Required when isExtra is true
}

export interface BulkEnrollPayload {
  studentAcademicRecordId?: string
  studentId?: string // Alternative to studentAcademicRecordId
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
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
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

export interface PaginatedEnrollments {
  data: Enrollment[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getEnrollments(params?: {
  studentId?: string
  studentAcademicRecordId?: string
  courseId?: string
  status?: EnrollmentStatus
  search?: string
  batchId?: string
  sectionId?: string
  studentStatus?: string
  page?: number
  limit?: number
}): Promise<PaginatedEnrollments> {
  const { data } = await apiClient.get<ApiList>('/enrollments', { params })
  return {
    data: data.data,
    pagination: data.pagination,
  }
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

export async function getAvailableAllocations(
  courseId: string,
): Promise<AvailableAllocation[]> {
  const { data } = await apiClient.get<{ success: boolean; data: AvailableAllocation[] }>(
    `/enrollments/available-allocations/${courseId}`,
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

export interface BulkReEnrollPayload {
  batchId?: string
  academicSessionId?: string
  dryRun?: boolean
}

export interface BulkReEnrollResult {
  dryRun: boolean
  summary: {
    totalStudentsFound: number
    studentsProcessed: number
    studentsSkipped: number
    totalEnrollmentsCreated: number
    totalErrors: number
  }
  students: Array<{
    studentId: string
    studentName: string
    studentNumber: string
    recordId: string
    batchId: string
    semesterNumber: number
    enrollmentsBefore: number
    enrollmentsCreated: number
    coursesEnrolled: Array<{
      courseCode: string
      courseName: string
    }>
    errors: Array<{ courseId: string; error: string }>
  }>
  errors: Array<{ studentId: string; error: string }>
}

export async function bulkReEnroll(
  payload: BulkReEnrollPayload,
): Promise<BulkReEnrollResult> {
  const { data } = await apiClient.post<{
    success: boolean
    message: string
    data: BulkReEnrollResult
  }>('/enrollments/bulk-re-enroll', payload)
  return data.data
}
