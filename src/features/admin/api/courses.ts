import  apiClient  from '../../../api/client'
import type {
  BatchCurriculumCopyPreviewResponse,
  BatchCurriculumResponse,
  Course,
  CoursesListResult,
  CreateCoursePayload,
  CurrentSectionAllocationsResponse,
  CurrentSessionGroupsResponse,
  SaveBatchCurriculumPayload,
  SectionAllocationHistoryResponse,
  UpdateCoursePayload,
} from "../types/course.types";

type ApiList = {
  success: boolean
  data: Course[]
  meta: CoursesListResult['meta']
}

type ApiOne = {
  success: boolean
  data: Course
}

export const coursesApi = {
  list: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<CoursesListResult> => {
    const { data } = await apiClient.get<ApiList>('/courses', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        ...(params?.search ? { search: params.search } : {}),
      },
    })
    return { data: data.data, meta: data.meta }
  },

  get: async (id: string): Promise<Course> => {
    const { data } = await apiClient.get<ApiOne>(`/courses/${id}`)
    return data.data
  },

  create: async (payload: CreateCoursePayload): Promise<Course> => {
    const { data } = await apiClient.post<ApiOne>('/courses', payload)
    return data.data
  },

  update: async (
    id: string,
    payload: UpdateCoursePayload,
  ): Promise<Course> => {
    const { data } = await apiClient.patch<ApiOne>(`/courses/${id}`, payload)
    return data.data
  },

}

export const batchCurriculumApi = {
  get: (batchId: string) =>
    apiClient
      .get<BatchCurriculumResponse>(`/batches/${batchId}/curriculum`)
      .then((response) => response.data),

  copyPreview: (
    targetBatchId: string,
    sourceBatchId: string,
    semesterId?: string,
  ) =>
    apiClient
      .get<BatchCurriculumCopyPreviewResponse>(
        `/batches/${targetBatchId}/curriculum/copy-preview`,
        {
          params: {
            sourceBatchId,
            ...(semesterId ? { semesterId } : {}),
          },
        },
      )
      .then((response) => response.data),

  save: (batchId: string, payload: SaveBatchCurriculumPayload) =>
    apiClient
      .put<BatchCurriculumResponse>(`/batches/${batchId}/curriculum`, payload)
      .then((response) => response.data),
};

export const allocationApis = {
  getCurrentSessionGroups: () =>
    apiClient
      .get<CurrentSessionGroupsResponse>("/allocations/groups/current")
      .then((response) => response.data),

  getCurrentSectionAllocations: (sectionId: string) =>
    apiClient
      .get<CurrentSectionAllocationsResponse>(
        `/allocations/current/${sectionId}`,
      )
      .then((response) => response.data),

  getSectionAllocationHistory: (sectionId: string) =>
    apiClient
      .get<SectionAllocationHistoryResponse>(
        `/allocations/history/${sectionId}`,
      )
      .then((response) => response.data),
};