import apiClient from '../../../api/client'

export interface FacultyProfile {
  id: string
  employeeNumber: string
  firstName: string
  middleName?: string
  lastName?: string
  email?: string
  phone?: string
  designation?: string
  qualification?: string
  joiningDate?: string
  status: string
  user: {
    id: string
    username: string
  }
}

export interface CourseAllocation {
  id: string
  course: {
    id: string
    code: string
    name: string
    creditHours: number
  }
  section: {
    id: string
    name: string
    batch: {
      id: string
      name: string
    }
  }
  semesterNumber: number
  academicSession: {
    id: string
    name: string
  }
}

export interface TeachingLoad {
  allocations: CourseAllocation[]
  totalCourses: number
  totalCreditHours: number
}

export interface AllocationDetails extends CourseAllocation {
  studentCount: number
}

export interface EnrolledStudent {
  enrollmentId: string
  status: string
  student: {
    id: string
    stdRegNumber: string
    firstName: string
    middleName?: string
    lastName?: string
    email?: string
    phone?: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

// Get logged-in faculty's profile
export const getMyProfile = async (): Promise<FacultyProfile> => {
  const response = await apiClient.get<ApiResponse<FacultyProfile>>('/faculty/me')
  return response.data.data
}

// Get logged-in faculty's teaching load
export const getMyTeachingLoad = async (academicSessionId?: string): Promise<TeachingLoad> => {
  const params = academicSessionId ? { academicSessionId } : {}
  const response = await apiClient.get<ApiResponse<TeachingLoad>>('/faculty/me/teaching-load', {
    params,
  })
  return response.data.data
}

// Get allocation details
export const getAllocationDetails = async (allocationId: string): Promise<AllocationDetails> => {
  const response = await apiClient.get<ApiResponse<AllocationDetails>>(
    `/faculty/me/allocations/${allocationId}`
  )
  return response.data.data
}

// Get students enrolled in allocation
export const getAllocationStudents = async (allocationId: string): Promise<EnrolledStudent[]> => {
  const response = await apiClient.get<ApiResponse<EnrolledStudent[]>>(
    `/faculty/me/allocations/${allocationId}/students`
  )
  return response.data.data
}

// Assessment Types
export interface AssessmentCategory {
  id: string
  name: string
  weightage: number
  displayOrder: number
}

export interface Assessment {
  id: string
  courseAllocationId: string
  assessmentCategoryId: string
  title: string
  totalMarks: number
  assessmentDate: string | null
  status: 'draft' | 'submitted'
  assessmentCategory: AssessmentCategory
  _count?: {
    studentMarks: number
  }
  createdAt: string
  submittedAt?: string
}

export interface StudentMark {
  id: string
  assessmentId: string
  studentId: string
  marksObtained: number
  remarks: string | null
}

export interface StudentWithMark {
  studentId: string
  rollNumber: string
  name: string
  section: string
  mark: StudentMark | null
}

export interface AssessmentDetails {
  assessment: Assessment & {
    courseAllocation: {
      course: { code: string; name: string }
      section: { name: string }
      semester: { number: number; name: string }
      academicSession: { name: string }
    }
  }
  students: StudentWithMark[]
  statistics: {
    totalStudents: number
    marksEntered: number
    pending: number
    averageMarks: number
  }
}

export interface CreateAssessmentDto {
  courseAllocationId: string
  assessmentCategoryId: string
  title: string
  totalMarks: number
  assessmentDate?: string
}

export interface UpdateAssessmentDto {
  title?: string
  totalMarks?: number
  assessmentDate?: string
}

export interface MarkEntryDto {
  studentId: string
  marksObtained: number
  remarks?: string
}

export interface BulkMarkEntryDto {
  assessmentId: string
  marks: MarkEntryDto[]
}

// Assessment API Calls

// Get all assessment categories
export const getAssessmentCategories = async (): Promise<AssessmentCategory[]> => {
  const response = await apiClient.get<ApiResponse<AssessmentCategory[]>>(
    '/faculty/assessments/categories'
  )
  return response.data.data
}

// Get assessments for an allocation
export const getAllocationAssessments = async (allocationId: string): Promise<Assessment[]> => {
  const response = await apiClient.get<ApiResponse<Assessment[]>>(
    `/faculty/assessments/allocation/${allocationId}`
  )
  return response.data.data
}

// Create assessment
export const createAssessment = async (dto: CreateAssessmentDto): Promise<Assessment> => {
  const response = await apiClient.post<ApiResponse<Assessment>>('/faculty/assessments', dto)
  return response.data.data
}

// Update assessment
export const updateAssessment = async (
  id: string,
  dto: UpdateAssessmentDto
): Promise<Assessment> => {
  const response = await apiClient.put<ApiResponse<Assessment>>(`/faculty/assessments/${id}`, dto)
  return response.data.data
}

// Delete assessment
export const deleteAssessment = async (id: string): Promise<void> => {
  await apiClient.delete(`/faculty/assessments/${id}`)
}

// Get assessment details with marks
export const getAssessmentDetails = async (id: string): Promise<AssessmentDetails> => {
  const response = await apiClient.get<ApiResponse<AssessmentDetails>>(
    `/faculty/assessments/${id}/details`
  )
  return response.data.data
}

// Bulk mark entry
export const bulkMarkEntry = async (dto: BulkMarkEntryDto): Promise<StudentMark[]> => {
  const response = await apiClient.post<ApiResponse<StudentMark[]>>(
    '/faculty/assessments/marks/bulk',
    dto
  )
  return response.data.data
}

// Update single student mark
export const updateStudentMark = async (
  assessmentId: string,
  studentId: string,
  marksObtained: number,
  remarks?: string
): Promise<StudentMark> => {
  const response = await apiClient.put<ApiResponse<StudentMark>>(
    `/faculty/assessments/${assessmentId}/marks/${studentId}`,
    { marksObtained, remarks }
  )
  return response.data.data
}

// Submit assessment
export const submitAssessment = async (id: string): Promise<Assessment> => {
  const response = await apiClient.post<ApiResponse<Assessment>>(
    `/faculty/assessments/${id}/submit`
  )
  return response.data.data
}
