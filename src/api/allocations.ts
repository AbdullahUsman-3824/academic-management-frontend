import apiClient from './client'

export interface Allocation {
  id: string
  facultyId: string
  courseId: string
  sectionId: string
  semesterId: string
  academicSessionId: string
  status: string
  createdAt: string
  course?: {
    id: string
    code: string
    name: string
    creditHours: number
  }
  faculty?: {
    id: string
    firstName: string
    middleName?: string | null
    lastName: string
    employeeNumber: string
    designation?: string | null
  }
  section?: {
    id: string
    name: string
    capacity: number
    batch?: {
      id: string
      name: string
      academicYear: number
    }
  }
  semester?: {
    id: string
    number: number
    name: string
    displayName: string
  }
  academicSession?: {
    id: string
    name: string
    startDate: string
    endDate: string
  }
}

export interface AllocationWithCourseStatus {
  course: {
    id: string
    code: string
    name: string
    creditHours: number
    courseType?: string
  }
  isCompulsory: boolean
  allocation: Allocation | null
}

export interface CreateAllocationPayload {
  facultyId: string
  courseId: string
  sectionId: string
  semesterId: string
  academicSessionId?: string
}

export interface BulkCreateAllocationsPayload {
  facultyId: string
  courseIds: string[]
  sectionId: string
  semesterId: string
  academicSessionId?: string
}

export interface BulkCreateResult {
  success: Allocation[]
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
  data: Allocation[]
}

type ApiOne = {
  success: boolean
  data: Allocation
}

type ApiBulk = {
  success: boolean
  data: BulkCreateResult
}

type ApiStatusList = {
  success: boolean
  data: AllocationWithCourseStatus[]
}

export async function getAllocations(params?: {
  facultyId?: string
  sectionId?: string
  semesterId?: string
  academicSessionId?: string
  status?: string
}): Promise<Allocation[]> {
  const { data } = await apiClient.get<ApiList>('/allocations', { params })
  return data.data
}

export async function getAllocation(id: string): Promise<Allocation> {
  const { data } = await apiClient.get<ApiOne>(`/allocations/${id}`)
  return data.data
}

export async function getAllocationsBySectionSemester(
  sectionId: string,
  semesterId: string,
): Promise<AllocationWithCourseStatus[]> {
  const { data } = await apiClient.get<ApiStatusList>(
    `/allocations/section/${sectionId}/semester/${semesterId}`,
  )
  return data.data
}

export async function createAllocation(
  payload: CreateAllocationPayload,
): Promise<Allocation> {
  const { data } = await apiClient.post<ApiOne>('/allocations', payload)
  return data.data
}

export async function bulkCreateAllocations(
  payload: BulkCreateAllocationsPayload,
): Promise<BulkCreateResult> {
  const { data } = await apiClient.post<ApiBulk>('/allocations/bulk', payload)
  return data.data
}

export async function deleteAllocation(id: string): Promise<void> {
  await apiClient.delete(`/allocations/${id}`)
}
