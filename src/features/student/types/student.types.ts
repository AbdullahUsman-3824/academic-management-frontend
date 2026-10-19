import type { StudentStatus, Gender } from "../../../types/student.types";

export interface StudentSelfProfile {
  id: string;
  stdRegNumber: string;
  fullName: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  cnic: string | null;
  profileImageUrl: string | null;
  address: string | null;
  city: string | null;
  guardianName: string | null;
  guardianRelation: string | null;
  guardianPhone: string | null;
  batchName: string | null;
  currentSemester: number | null;
  currentSection: string | null;
  status: StudentStatus;
  currentAcademicSession: string | null;
  admissionDate: string | null;
  username: string;
  lastLoginAt: string | null;
}

/** Student sirf limited fields update kar sakta hai */
export interface UpdateStudentSelfDto {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  profileImageUrl?: string | null;
}
