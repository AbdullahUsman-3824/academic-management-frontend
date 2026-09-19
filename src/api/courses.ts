import  apiClient  from './client'

export type CourseStatus = 'active' | 'inactive'

export interface Course {
  id: string
  code: string
  name: string
  description?: string | null
  creditHours: number
  status: CourseStatus
  createdAt: string
  updatedAt?: string | null
}

export interface CoursesListResult {
  data: Course[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateCoursePayload {
  code: string
  name: string
  description?: string
  creditHours: number
}

export interface UpdateCoursePayload {
  code?: string
  name?: string
  description?: string
  creditHours?: number
}

type ApiList = {
  success: boolean
  data: Course[]
  meta: CoursesListResult['meta']
}

type ApiOne = {
  success: boolean
  data: Course
}

export async function getCourses(params?: {
  page?: number
  limit?: number
  search?: string
  status?: CourseStatus
}): Promise<CoursesListResult> {
  const { data } = await apiClient.get<ApiList>('/courses', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
    },
  })
  return { data: data.data, meta: data.meta }
}

export async function getCourse(id: string): Promise<Course> {
  const { data } = await apiClient.get<ApiOne>(`/courses/${id}`)
  return data.data
}

export async function createCourse(
  payload: CreateCoursePayload,
): Promise<Course> {
  const { data } = await apiClient.post<ApiOne>('/courses', payload)
  return data.data
}

export async function updateCourse(
  id: string,
  payload: UpdateCoursePayload,
): Promise<Course> {
  const { data } = await apiClient.patch<ApiOne>(`/courses/${id}`, payload)
  return data.data
}

export async function updateCourseStatus(
  id: string,
  status: CourseStatus,
): Promise<Course> {
  const { data } = await apiClient.patch<ApiOne>(`/courses/${id}/status`, {
    status,
  })
  return data.data
}