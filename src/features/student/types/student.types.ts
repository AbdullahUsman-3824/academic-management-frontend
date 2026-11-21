import type { StudentStatus, Gender } from "../../../types/student.types";

/** Envelope used by every successful response */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/** GET /students/me */
export interface StudentBasicInfo {
  id: string;
  stdRegNumber: string;
  fullName: string;
  profileImageUrl: string | null;
  currentSemester: number | null;
  currentSection: string | null;
}

/** An enrolled course as returned inside the dashboard.
 *  Backend currently returns an empty array, so fields are optional. */
export interface StudentDashboardCourse {
  id: string;
  code?: string;
  name?: string;
  creditHours?: number;
}

/** GET /students/me/dashboard */
export interface StudentDashboard {
  studentId: string;
  currentSemester: number | null;
  courses: StudentDashboardCourse[];
  recentAssessments: unknown[]; // empty until backend implements it
  announcements: unknown[]; // empty until backend implements it
}

/** GET /students/me/course-options */
export interface StudentCourseOption {
  id: string;
  code: string;
  name: string;
}

/** GET /students/me/marks */
export interface StudentMark {
  id: string;
  assessment: string;
  marks: {
    total: number;
    obtained: number;
  };
  course: {
    code: string;
    name: string;
  };
}

export interface StudentMarksParams {
  courseId?: string;
  category?: string;
}

/** GET /students/me/profile */
export interface StudentProfile {
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