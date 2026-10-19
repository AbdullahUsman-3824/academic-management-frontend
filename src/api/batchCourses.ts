import apiClient from './client';

export interface BatchCourseAssignment {
  id: string;
  batchId: string;
  sectionId: string | null;
  courseId: string;
  semesterNumber: number;
  isCompulsory: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
  batch?: {
    id: string;
    name: string;
  };
  section?: {
    id: string;
    name: string;
  } | null;
  course?: {
    id: string;
    code: string;
    name: string;
    creditHours: number;
  };
}

export interface CreateBatchCourseAssignmentDto {
  batchId: string;
  sectionId?: string;
  courseId: string;
  semesterNumber: number;
  isCompulsory?: boolean;
  displayOrder?: number;
}

export interface BulkAssignCoursesDto {
  batchId: string;
  sectionId?: string;
  semesterNumber: number;
  courseIds: string[];
  isCompulsory?: boolean;
}

export const batchCoursesAPI = {
  // Get courses assigned to a batch/semester
  getAssignments: async (params: {
    batchId: string;
    semesterNumber?: number;
    sectionId?: string;
  }): Promise<BatchCourseAssignment[]> => {
    const { data } = await apiClient.get<BatchCourseAssignment[]>('/batch-course-assignments', {
      params,
    });
    return data;
  },

  // Get a single assignment
  getAssignment: async (id: string): Promise<BatchCourseAssignment> => {
    const { data } = await apiClient.get<BatchCourseAssignment>(`/batch-course-assignments/${id}`);
    return data;
  },

  // Assign a single course
  createAssignment: async (dto: CreateBatchCourseAssignmentDto): Promise<BatchCourseAssignment> => {
    const { data } = await apiClient.post<BatchCourseAssignment>('/batch-course-assignments', dto);
    return data;
  },

  // Bulk assign multiple courses
  bulkAssign: async (dto: BulkAssignCoursesDto): Promise<{ count: number }> => {
    const { data } = await apiClient.post<{ count: number }>('/batch-course-assignments/bulk', dto);
    return data;
  },

  // Update assignment
  updateAssignment: async (
    id: string,
    dto: { isCompulsory?: boolean; displayOrder?: number }
  ): Promise<BatchCourseAssignment> => {
    const { data } = await apiClient.patch<BatchCourseAssignment>(`/batch-course-assignments/${id}`, dto);
    return data;
  },

  // Remove a single assignment
  removeAssignment: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(`/batch-course-assignments/${id}`);
    return data;
  },

  // Remove all courses from a batch/semester
  removeAll: async (params: {
    batchId: string;
    semesterNumber?: number;
    sectionId?: string;
  }): Promise<{ count: number }> => {
    const { data } = await apiClient.delete<{ count: number }>('/batch-course-assignments', {
      params,
    });
    return data;
  },

  // Preview template copy
  previewTemplateCopy: async (params: {
    batchId: string;
    semesterNumber: number;
    sectionId?: string;
  }): Promise<{
    preview: Array<{
      semesterNumber: number;
      semesterName: string;
      courseId: string;
      courseCode: string;
      courseName: string;
      creditHours: number;
      isCompulsory: boolean;
      displayOrder: number;
      alreadyAssigned: boolean;
    }>;
    summary: {
      totalCourses: number;
      newCourses: number;
      existingCourses: number;
    };
  }> => {
    const { data } = await apiClient.get(
      `/batch-course-assignments/preview-template/${params.batchId}`,
      {
        params: {
          semesterNumber: params.semesterNumber,
          sectionId: params.sectionId,
        },
      }
    );
    return data;
  },

  // Copy from template
  copyFromTemplate: async (params: {
    batchId: string;
    semesterNumber: number;
    sectionId?: string;
  }): Promise<{ count: number; message: string }> => {
    const { data } = await apiClient.post<{ count: number; message: string }>(
      '/batch-course-assignments/copy-from-template',
      params
    );
    return data;
  },
};
