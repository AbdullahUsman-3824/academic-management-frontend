import type { Gender } from "../../api/students";
import type { StudentStatus } from "../../hooks/useStudentQueries";

// ── Page navigation ──────────────────────────────────────────────────────────

export type PageView = "list" | "detail" | "create" | "edit" | "bulk";

// ── Form ─────────────────────────────────────────────────────────────────────

export interface StudentFormValues {
  batchId: string;
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
  onChange: (field: keyof StudentFormValues, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const STATUS_FILTERS: Array<{ label: string; value: "all" | StudentStatus }> = [
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
