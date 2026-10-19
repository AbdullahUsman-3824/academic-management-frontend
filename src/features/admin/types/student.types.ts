import type {
  StudentStatus,
  Gender,
  StudentListMeta,
} from "../../../types/student.types";

// ── List ──────────────────────────────────────────────────
export interface AdminStudentListItem {
  id: string;
  stdRegNumber: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  batchName: string | null;
  currentSemester: number | null;
  currentSection: string | null;
  status: StudentStatus;
  admissionDate: string | null;
}

export interface AdminStudentListResponse {
  success?: boolean;
  data: AdminStudentListItem[];
  meta: StudentListMeta;
}

// ── Detail (full) ─────────────────────────────────────────
export interface AdminStudentDetail extends AdminStudentListItem {
  gender: Gender | null;
  dateOfBirth: string | null;
  cnic: string | null;
  profileImageUrl: string | null;
  address: string | null;
  city: string | null;
  guardianName: string | null;
  guardianRelation: string | null;
  guardianPhone: string | null;
  guardianCnic: string | null;
  username: string;
  accountStatus: string;
  lastLoginAt: string | null;
  currentAcademicSession: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ── DTOs ──────────────────────────────────────────────────
export interface CreateStudentDto {
  batchId: string;
  academicSessionId?: string;
  semesterNumber?: number;
  sectionId?: string | null;
  stdRegNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  cnic?: string | null;
  profileImageUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  guardianName?: string | null;
  guardianRelation?: string | null;
  guardianPhone?: string | null;
  guardianCnic?: string | null;
  admissionDate?: string | null;
}

/** Backend UpdateStudentDto ke saath sync — sectionId / semesterNumber nahi */
export interface UpdateStudentDto {
  batchId?: string;
  firstName?: string;
  middleName?: string | null;
  lastName?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  cnic?: string | null;
  profileImageUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  guardianName?: string | null;
  guardianRelation?: string | null;
  guardianPhone?: string | null;
  guardianCnic?: string | null;
  admissionDate?: string | null;
}

export interface UpdateStudentStatusDto {
  status: StudentStatus;
}

export interface CreateStudentResult {
  id: string;
  message: string;
  createdAt: string;
}

export interface BulkEnrollmentError {
  row: number;
  stdRegNumber: string | null;
  errors: string[];
}

export interface BulkEnrollmentResult {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: BulkEnrollmentError[];
}

// ── Form ──────────────────────────────────────────────────
export interface StudentFormValues {
  batchId: string;
  sectionId: string;
  semesterNumber: string;
  academicSessionId: string;
  stdRegNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: "" | Gender;
  cnic: string;
  profileImageUrl: string;
  phone: string;
  address: string;
  city: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianCnic: string;
  admissionDate: string;
}

export interface StudentFormProps {
  mode: "create" | "edit";
  values: StudentFormValues;
  batches: { id: string; name: string }[];
  batchesLoading: boolean;
  sections: { id: string; name: string }[];
  sectionsLoading: boolean;
  academicSessions: { id: string; name: string }[];
  academicSessionsLoading: boolean;
  onChange: (field: keyof StudentFormValues, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export const STATUS_FILTERS: Array<{
  label: string;
  value: "all" | StudentStatus;
}> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Graduated", value: "graduated" },
];

export const STATUS_CLASS: Record<StudentStatus, string> = {
  active: "active",
  inactive: "inactive",
  graduated: "graduated",
};

export const EMPTY_FORM: StudentFormValues = {
  batchId: "",
  sectionId: "",
  semesterNumber: "1",
  academicSessionId: "",
  stdRegNumber: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  dateOfBirth: "",
  gender: "",
  cnic: "",
  profileImageUrl: "",
  phone: "",
  address: "",
  city: "",
  guardianName: "",
  guardianRelation: "",
  guardianPhone: "",
  guardianCnic: "",
  admissionDate: "",
};
