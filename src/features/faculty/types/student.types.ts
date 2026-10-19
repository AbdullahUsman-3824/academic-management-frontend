import type {
  StudentStatus,
  Gender,
  StudentListMeta,
} from "../../../types/student.types";

/** List view for Faculty */
export interface FacultyStudentListItem {
  id: string;
  stdRegNumber: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  batchName: string | null;
  currentSemester: number | null;
  currentSection: string | null;
  status: StudentStatus;
}

/** Detail view for Faculty (limited personal info) */
export interface FacultyStudentDetail extends FacultyStudentListItem {
  gender: Gender | null;
  profileImageUrl: string | null;
  currentAcademicSession: string | null;
  // CNIC, address, guardian details intentionally omitted
}

export interface FacultyStudentListResponse {
  success?: boolean;
  data: FacultyStudentListItem[];
  meta: StudentListMeta;
}

export interface FacultyStudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentStatus;
  batchId?: string;
}
