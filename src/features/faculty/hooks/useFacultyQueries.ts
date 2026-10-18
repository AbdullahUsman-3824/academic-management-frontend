import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as facultyApi from '../api/faculty'

// Faculty profile
export const useFacultyProfile = () => {
  return useQuery({
    queryKey: ['faculty', 'me'],
    queryFn: facultyApi.getMyProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Faculty teaching load
export const useFacultyTeachingLoad = (academicSessionId?: string) => {
  return useQuery({
    queryKey: ['faculty', 'teaching-load', academicSessionId],
    queryFn: () => facultyApi.getMyTeachingLoad(academicSessionId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Allocation details
export const useAllocationDetails = (allocationId: string | null) => {
  return useQuery({
    queryKey: ['faculty', 'allocation', allocationId],
    queryFn: () => facultyApi.getAllocationDetails(allocationId!),
    enabled: !!allocationId,
    staleTime: 2 * 60 * 1000,
  })
}

// Allocation students
export const useAllocationStudents = (allocationId: string | null) => {
  return useQuery({
    queryKey: ['faculty', 'allocation', allocationId, 'students'],
    queryFn: () => facultyApi.getAllocationStudents(allocationId!),
    enabled: !!allocationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Assessment categories
export const useAssessmentCategories = () => {
  return useQuery({
    queryKey: ['assessment', 'categories'],
    queryFn: facultyApi.getAssessmentCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Allocation assessments
export const useAllocationAssessments = (allocationId: string | null) => {
  return useQuery({
    queryKey: ['assessments', 'allocation', allocationId],
    queryFn: () => facultyApi.getAllocationAssessments(allocationId!),
    enabled: !!allocationId,
    staleTime: 1 * 60 * 1000,
  })
}

// Assessment details with marks
export const useAssessmentDetails = (assessmentId: string | null) => {
  return useQuery({
    queryKey: ['assessments', assessmentId, 'details'],
    queryFn: () => facultyApi.getAssessmentDetails(assessmentId!),
    enabled: !!assessmentId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Create assessment mutation
export const useCreateAssessment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: facultyApi.createAssessment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'allocation', data.courseAllocationId],
      })
    },
  })
}

// Update assessment mutation
export const useUpdateAssessment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: facultyApi.UpdateAssessmentDto }) =>
      facultyApi.updateAssessment(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', data.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'allocation', data.courseAllocationId],
      })
    },
  })
}

// Delete assessment mutation
export const useDeleteAssessment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: facultyApi.deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments'],
      })
    },
  })
}

// Bulk mark entry mutation
export const useBulkMarkEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: facultyApi.bulkMarkEntry,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', variables.assessmentId, 'details'],
      })
    },
  })
}

// Update student mark mutation
export const useUpdateStudentMark = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      assessmentId,
      studentId,
      marksObtained,
      remarks,
    }: {
      assessmentId: string
      studentId: string
      marksObtained: number
      remarks?: string
    }) => facultyApi.updateStudentMark(assessmentId, studentId, marksObtained, remarks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', variables.assessmentId, 'details'],
      })
    },
  })
}

// Submit assessment mutation
export const useSubmitAssessment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: facultyApi.submitAssessment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', data.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'allocation', data.courseAllocationId],
      })
    },
  })
}
