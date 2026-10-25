import apiClient from './client'

export interface Semester {
  id: string
  number: number
  name: string
  displayName: string
  minCredits: number
  maxCredits: number
}

export interface SemesterCourse {
  id: string
  semesterId: string
  courseId: string
  isCompulsory: boolean
  displayOrder: number
  createdAt: string
  semester?: Semester
  course?: {
    id: string
    code: string
    name: string
    creditHours: number
    courseType?: string
    status: string
  }
}

export interface CreateSemesterCoursePayload {
  semesterId: string
  courseId: string
  isCompulsory: boolean
  displayOrder: number
}

export interface BulkCreateSemesterCoursesPayload {
  semesterId: string
  courses: Array<{
    courseId: string
    isCompulsory: boolean
    displayOrder: number
  }>
}

export interface BulkCreateResult {
  success: SemesterCourse[]
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

type ApiList = {
  success: boolean
  data: SemesterCourse[]
}

type ApiOne = {
  success: boolean
  data: SemesterCourse
}

type ApiBulk = {
  success: boolean
  data: BulkCreateResult
}

export async function getSemesterCourses(params?: {
  semesterNumber?: number
}): Promise<SemesterCourse[]> {
  const { data } = await apiClient.get<ApiList>('/semester-courses', {
    params,
  })
  return data.data
}

export async function getSemesterCoursesBySemesterId(
  semesterId: string,
): Promise<SemesterCourse[]> {
  const { data } = await apiClient.get<ApiList>(
    `/semester-courses/semester/${semesterId}`,
  )
  return data.data
}

export async function getSemesterCoursesBySemesterNumber(
  semesterNumber: number,
): Promise<SemesterCourse[]> {
  const { data } = await apiClient.get<ApiList>(
    `/semester-courses/semester-number/${semesterNumber}`,
  )
  return data.data
}

export async function createSemesterCourse(
  payload: CreateSemesterCoursePayload,
): Promise<SemesterCourse> {
  const { data } = await apiClient.post<ApiOne>('/semester-courses', payload)
  return data.data
}

export async function bulkCreateSemesterCourses(
  payload: BulkCreateSemesterCoursesPayload,
): Promise<BulkCreateResult> {
  const { data } = await apiClient.post<ApiBulk>(
    '/semester-courses/bulk',
    payload,
  )
  return data.data
}

export async function deleteSemesterCourse(id: string): Promise<void> {
  await apiClient.delete(`/semester-courses/${id}`)
}

export async function getSemesters(): Promise<Semester[]> {
  const { data } = await apiClient.get<{ success: boolean; data: Semester[] }>(
    '/academics/semesters',
  )
  return data.data
}
