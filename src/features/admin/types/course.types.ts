export type SemesterStatus = "upcoming" | "active" | "locked";
export type AllocationStatus = "allocated" | "unallocated";
export type EnrollmentStatus = "pending" | "confirmed";
export type RepeatStatus = "failed" | "repeat";

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  creditHours: number;
  usageCount: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CoursesListResult {
  data: Course[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCoursePayload {
  code: string;
  name: string;
  description?: string;
  creditHours: number;
}

export interface UpdateCoursePayload {
  code?: string;
  name?: string;
  description?: string;
  creditHours?: number;
}

export interface BatchCurriculumBatch {
  id: string;
  name: string;
}

export interface BatchCurriculumCourse {
  assignmentId: string;
  courseId: string;
  code: string;
  name: string;
  description: string | null;
  creditHours: number;
  displayOrder: number;
}

export interface BatchCurriculumSemester {
  semesterId: string;
  semesterNumber: number;
  minCredits: number;
  maxCredits: number;
  isLocked: boolean;
  courses: BatchCurriculumCourse[];
  totalCourses: number;
  totalCreditHours: number;
}

export interface BatchCurriculumResponse {
  batch: BatchCurriculumBatch;
  semesters: BatchCurriculumSemester[];
}

export interface BatchCurriculumCopyPreviewResponse {
  sourceBatch: BatchCurriculumBatch;
  semesters: BatchCurriculumSemester[];
}

export interface SaveBatchCurriculumPayload {
  semesters: {
    semesterId: string;
    courses: {
      courseId: string;
      displayOrder: number;
    }[];
  }[];
}

export type AllocationRecordStatus = "active" | "inactive";

export interface CurrentSessionGroupsResponse {
  session: {
    id: string;
    name: string;
  };
  groups: {
    batchId: string;
    batchName: string;
    semester: number | null;
    canAllocate: boolean;
    sections: {
      id: string;
      name: string;
    }[];
  }[];
}

export interface CurrentSectionAllocationsResponse {
  group: {
    batch: string;
    semester: number;
    section: string;
  };
  courses: {
    batchCourseAssignmentId: string;
    isCompulsory: boolean;
    courseId: string;
    code: string;
    name: string;
    creditHours: number;
    allocation: {
      id: string;
      facultyId: string;
      facultyName: string;
      status: AllocationRecordStatus;
    } | null;
  }[];
}

export interface AllocationFacultyOption {
  id: string;
  employeeNumber: string;
  name: string;
  designation: string | null;
  workload: number;
  maxWorkload: number;
  atCapacity: boolean;
}

export interface CreateAllocationPayload {
  batchCourseAssignmentId: string;
  facultyId: string;
  sectionId: string;
}

export interface CreateAllocationResult {
  id: string;
  batchCourseAssignmentId: string;
  courseId: string;
  courseCode: string;
  facultyId: string;
  sectionId: string;
  academicSessionId: string;
  status: AllocationRecordStatus;
  reactivated: boolean;
  enrollment: {
    enrolled: number;
    reactivated: number;
    skippedAlreadyEnrolled: number;
    skippedCreditLimit: unknown[];
  };
}

export interface UpdateAllocationPayload {
  facultyId: string;
}

export interface UpdateAllocationResult {
  id: string;
  batchCourseAssignmentId: string;
  courseCode: string;
  facultyId: string;
  facultyName: string;
  status: AllocationRecordStatus;
}

export interface SectionAllocationHistoryResponse {
  batch: string;
  section: string;
  history: {
    semester: number;
    courses: {
      batchCourseAssignmentId: string;
      courseId: string;
      code: string;
      name: string;
      creditHours: number;
      courseStatus: AllocationRecordStatus;
      isCompulsory: boolean;
      allocations: {
        id: string;
        type: "REGULAR";
        status: AllocationRecordStatus;
        createdAt: string;
        session: {
          id: string;
          name: string;
          startDate: string;
          endDate: string;
        };
        faculty: {
          id: string;
          name: string;
          employeeNumber: string;
        };
      }[];
    }[];
  }[];
}

export interface MockCourse {
  id: string;
  code: string;
  name: string;
  description: string;
  creditHours: number;
}

export interface FacultyOption {
  id: string;
  name: string;
  employeeNumber: string;
  status: "active" | "inactive";
  workload: number;
}

export interface CurriculumCourse {
  courseId: string;
  code: string;
  name: string;
  creditHours: number;
  mandatory: true;
}

export interface CurriculumSemester {
  semesterNumber: number;
  status: SemesterStatus;
  minCredits: number;
  maxCredits: number;
  courses: CurriculumCourse[];
}

export interface BatchCurriculum {
  batchId: string;
  batchName: string;
  semesters: CurriculumSemester[];
}

export interface CourseAllocation {
  id: string;
  academicSessionId: string;
  batchId: string;
  semesterNumber: number;
  sectionId: string;
  courseId: string;
  facultyId: string | null;
  status: AllocationStatus;
}

export interface StudentEnrollment {
  id: string;
  studentName: string;
  registrationNo: string;
  batchId: string;
  semesterNumber: number;
  courseIds: string[];
  status: EnrollmentStatus;
  visibleInStudentPortal: boolean;
  isRepeat: boolean;
  allocationId?: string;
  failedCourseIds?: string[];
}

export interface RepeatEnrollment extends StudentEnrollment {
  courseId: string;
  allocationId: string;
  repeatStatus: RepeatStatus;
}
