import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

type StudentStatus = "active" | "inactive" | "graduated";
type Gender = "male" | "female" | "other";
type PageView = "list" | "detail" | "create" | "edit" | "bulk";

interface BatchRef {
  id: string;
  name: string;
}

interface StudentRecord {
  id: string;
  userId: string;
  username: string;
  batch: BatchRef;
  stdRegNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  email: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  cnic: string | null;
  profileImageUrl: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  guardianName: string | null;
  guardianRelation: string | null;
  guardianPhone: string | null;
  guardianCnic: string | null;
  admissionDate: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

interface StudentFormValues {
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

interface BulkResult {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: Array<{
    row: number;
    stdRegNumber: string | null;
    errors: string[];
  }>;
}

interface StudentFormProps {
  mode: "create" | "edit";
  values: StudentFormValues;
  onChange: (field: keyof StudentFormValues, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const STATUS_FILTERS: Array<{ label: string; value: "all" | StudentStatus }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Graduated", value: "graduated" },
];

const STATUS_CLASS: Record<StudentStatus, string> = {
  active: "active",
  inactive: "inactive",
  graduated: "graduated",
};

const MOCK_BATCHES: BatchRef[] = [
  { id: "8b4f2c31-7c51-4a0d-9e21-123456789abc", name: "SP26" },
  { id: "f5a72f4d-8f32-4f6c-8c91-2b99873f17c1", name: "FA25" },
  { id: "9fd2dc75-6b02-41a2-b8cf-a672f8b7cbd7", name: "SP25" },
];

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "c5b8c6a1-2c41-4f3a-8d7b-123456789abc",
    userId: "a91e4e3f-6b2d-4c19-8f12-987654321abc",
    username: "SP26-CS-001",
    batch: MOCK_BATCHES[0],
    stdRegNumber: "SP26-CS-001",
    firstName: "Ali",
    middleName: "Ahmed",
    lastName: "Khan",
    email: "ali.khan@example.com",
    dateOfBirth: "2007-04-15",
    gender: "male",
    cnic: "35202-1234567-1",
    profileImageUrl: "https://example.com/profile.jpg",
    phone: "03001234567",
    address: "House 12, Street 5",
    city: "Lahore",
    guardianName: "Muhammad Khan",
    guardianRelation: "Father",
    guardianPhone: "03009876543",
    guardianCnic: "35202-7654321-9",
    admissionDate: "2026-09-12",
    status: "active",
    createdAt: "2026-09-12T06:30:00.000Z",
    updatedAt: "2026-09-12T06:30:00.000Z",
  },
  {
    id: "f50d0adb-f7bf-4af4-8b55-410432de22da",
    userId: "92d4c8cb-31ae-4bb9-a215-b9e6d92ce89e",
    username: "FA25-CS-045",
    batch: MOCK_BATCHES[1],
    stdRegNumber: "FA25-CS-045",
    firstName: "Sana",
    middleName: null,
    lastName: "Malik",
    email: "sana.malik@example.com",
    dateOfBirth: "2006-11-20",
    gender: "female",
    cnic: "35202-2345678-4",
    profileImageUrl: null,
    phone: "03114567890",
    address: "Model Town Block C",
    city: "Lahore",
    guardianName: "Tariq Malik",
    guardianRelation: "Father",
    guardianPhone: "03115678901",
    guardianCnic: null,
    admissionDate: "2025-08-20",
    status: "inactive",
    createdAt: "2025-08-20T08:00:00.000Z",
    updatedAt: "2026-08-01T10:15:00.000Z",
  },
  {
    id: "e3f45485-2353-4f4c-a776-edbaf2f14532",
    userId: "d55c2210-c5fb-4f7a-8f66-a9020e6df46d",
    username: "SP25-LAW-010",
    batch: MOCK_BATCHES[2],
    stdRegNumber: "SP25-LAW-010",
    firstName: "Bilal",
    middleName: null,
    lastName: "Farooq",
    email: "bilal.farooq@example.com",
    dateOfBirth: "2004-01-09",
    gender: "male",
    cnic: "35202-4455667-3",
    profileImageUrl: null,
    phone: "03331230001",
    address: "Gulberg III",
    city: "Lahore",
    guardianName: "Farooq Ahmed",
    guardianRelation: "Father",
    guardianPhone: "03332220001",
    guardianCnic: "35202-7788990-5",
    admissionDate: "2025-01-15",
    status: "graduated",
    createdAt: "2025-01-15T09:00:00.000Z",
    updatedAt: "2026-06-22T16:10:00.000Z",
  },
];

const EMPTY_FORM: StudentFormValues = {
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

function toLabel(value: StudentStatus): string {
  if (value === "active") return "Active";
  if (value === "inactive") return "Inactive";
  return "Graduated";
}

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getDisplayName(student: StudentRecord): string {
  return [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");
}

function getTodayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

function toStudentFormValues(student: StudentRecord): StudentFormValues {
  return {
    batchId: student.batch.id,
    stdRegNumber: student.stdRegNumber,
    firstName: student.firstName,
    middleName: student.middleName ?? "",
    lastName: student.lastName ?? "",
    email: student.email ?? "",
    dateOfBirth: student.dateOfBirth ?? "",
    gender: student.gender ?? "",
    cnic: student.cnic ?? "",
    profileImageUrl: student.profileImageUrl ?? "",
    phone: student.phone ?? "",
    address: student.address ?? "",
    city: student.city ?? "",
    guardianName: student.guardianName ?? "",
    guardianRelation: student.guardianRelation ?? "",
    guardianPhone: student.guardianPhone ?? "",
    guardianCnic: student.guardianCnic ?? "",
    admissionDate: student.admissionDate,
  };
}

function StudentForm({
  mode,
  values,
  onChange,
  onCancel,
  onSubmit,
}: StudentFormProps) {
  const readOnly = mode === "edit";

  return (
    <div className="card">
      <div
        className="card-head"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <h2>
          {mode === "create" ? "Register Student" : "Update Student Profile"}
        </h2>
        <span className="meta">
          {mode === "create"
            ? "Maps to POST /api/students"
            : "Maps to PATCH /api/students/:id"}
        </span>
      </div>
      <div className="card-body">
        <div className="form-grid two-col">
          <label className="field-label">
            Batch
            <select
              className="field-control"
              value={values.batchId}
              onChange={(e) => onChange("batchId", e.target.value)}
            >
              <option value="">Select batch</option>
              {MOCK_BATCHES.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Registration Number
            <input
              className="field-control"
              type="text"
              value={values.stdRegNumber}
              onChange={(e) => onChange("stdRegNumber", e.target.value)}
              disabled={readOnly}
            />
          </label>

          <label className="field-label">
            First Name
            <input
              className="field-control"
              type="text"
              value={values.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
            />
          </label>

          <label className="field-label">
            Middle Name
            <input
              className="field-control"
              type="text"
              value={values.middleName}
              onChange={(e) => onChange("middleName", e.target.value)}
            />
          </label>

          <label className="field-label">
            Last Name
            <input
              className="field-control"
              type="text"
              value={values.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
            />
          </label>

          <label className="field-label">
            Email
            <input
              className="field-control"
              type="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </label>

          <label className="field-label">
            Date of Birth
            <input
              className="field-control"
              type="date"
              value={values.dateOfBirth}
              onChange={(e) => onChange("dateOfBirth", e.target.value)}
            />
          </label>

          <label className="field-label">
            Gender
            <select
              className="field-control"
              value={values.gender}
              onChange={(e) => onChange("gender", e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="other">other</option>
            </select>
          </label>

          <label className="field-label">
            CNIC
            <input
              className="field-control"
              type="text"
              value={values.cnic}
              onChange={(e) => onChange("cnic", e.target.value)}
            />
          </label>

          <label className="field-label">
            Profile Image URL
            <input
              className="field-control"
              type="url"
              value={values.profileImageUrl}
              onChange={(e) => onChange("profileImageUrl", e.target.value)}
            />
          </label>

          <label className="field-label">
            Phone
            <input
              className="field-control"
              type="text"
              value={values.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </label>

          <label className="field-label">
            City
            <input
              className="field-control"
              type="text"
              value={values.city}
              onChange={(e) => onChange("city", e.target.value)}
            />
          </label>

          <label className="field-label span-2">
            Address
            <input
              className="field-control"
              type="text"
              value={values.address}
              onChange={(e) => onChange("address", e.target.value)}
            />
          </label>

          <label className="field-label">
            Guardian Name
            <input
              className="field-control"
              type="text"
              value={values.guardianName}
              onChange={(e) => onChange("guardianName", e.target.value)}
            />
          </label>

          <label className="field-label">
            Guardian Relation
            <input
              className="field-control"
              type="text"
              value={values.guardianRelation}
              onChange={(e) => onChange("guardianRelation", e.target.value)}
            />
          </label>

          <label className="field-label">
            Guardian Phone
            <input
              className="field-control"
              type="text"
              value={values.guardianPhone}
              onChange={(e) => onChange("guardianPhone", e.target.value)}
            />
          </label>

          <label className="field-label">
            Guardian CNIC
            <input
              className="field-control"
              type="text"
              value={values.guardianCnic}
              onChange={(e) => onChange("guardianCnic", e.target.value)}
            />
          </label>

          <label className="field-label">
            Admission Date
            <input
              className="field-control"
              type="date"
              value={values.admissionDate}
              onChange={(e) => onChange("admissionDate", e.target.value)}
            />
          </label>
        </div>

        <div className="action-row" style={{ marginTop: 18 }}>
          <button type="button" className="btn" onClick={onSubmit}>
            {mode === "create" ? "Save Student" : "Update Student"}
          </button>
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentManagementPage() {
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [view, setView] = useState<PageView>("list");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentStatus>(
    "all",
  );
  const [batchFilter, setBatchFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [draft, setDraft] = useState<StudentFormValues>(EMPTY_FORM);
  const [statusDraft, setStatusDraft] = useState<StudentStatus>("active");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkDryRun, setBulkDryRun] = useState(true);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  );

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      if (statusFilter !== "all" && student.status !== statusFilter) {
        return false;
      }

      if (batchFilter && student.batch.id !== batchFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const fullName = getDisplayName(student).toLowerCase();

      return (
        fullName.includes(term) ||
        student.stdRegNumber.toLowerCase().includes(term) ||
        student.username.toLowerCase().includes(term) ||
        (student.phone ?? "").toLowerCase().includes(term) ||
        (student.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [students, search, statusFilter, batchFilter]);

  const total = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * limit;
  const paginatedStudents = filteredStudents.slice(offset, offset + limit);

  const listMetaText = `Page ${currentPage} of ${totalPages} · ${total} result${total === 1 ? "" : "s"}`;

  const handleFormChange = (field: keyof StudentFormValues, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const resetListView = () => {
    setView("list");
    setSelectedStudentId(null);
    setBulkResult(null);
  };

  const goToCreate = () => {
    setFeedback(null);
    setDraft(EMPTY_FORM);
    setView("create");
  };

  const goToEdit = () => {
    if (!selectedStudent) return;
    setFeedback(null);
    setDraft(toStudentFormValues(selectedStudent));
    setView("edit");
  };

  const validateCreateOrEdit = (
    mode: "create" | "edit",
  ): { ok: true } | { ok: false; message: string } => {
    if (!draft.batchId.trim()) {
      return { ok: false, message: "Batch is required." };
    }

    if (!draft.firstName.trim()) {
      return { ok: false, message: "First name is required." };
    }

    if (mode === "create" && !draft.stdRegNumber.trim()) {
      return { ok: false, message: "Registration number is required." };
    }

    const regExists = students.some(
      (student) =>
        student.stdRegNumber.toLowerCase() ===
          draft.stdRegNumber.trim().toLowerCase() &&
        student.id !== selectedStudentId,
    );

    if (regExists) {
      return {
        ok: false,
        message: "Student registration number already exists.",
      };
    }

    if (draft.cnic.trim()) {
      const cnicExists = students.some(
        (student) =>
          (student.cnic ?? "").toLowerCase() ===
            draft.cnic.trim().toLowerCase() && student.id !== selectedStudentId,
      );
      if (cnicExists) {
        return { ok: false, message: "CNIC already exists." };
      }
    }

    const batchExists = MOCK_BATCHES.some(
      (batch) => batch.id === draft.batchId,
    );
    if (!batchExists) {
      return { ok: false, message: "Batch not found." };
    }

    return { ok: true };
  };

  const handleCreate = () => {
    const validation = validateCreateOrEdit("create");
    if (!validation.ok) {
      setFeedback({ type: "error", message: validation.message });
      return;
    }

    const batch = MOCK_BATCHES.find((item) => item.id === draft.batchId);
    if (!batch) {
      setFeedback({ type: "error", message: "Batch not found." });
      return;
    }

    const nowIso = new Date().toISOString();
    const admissionDate = draft.admissionDate.trim() || getTodayIsoDate();

    const newStudent: StudentRecord = {
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      username: draft.stdRegNumber.trim(),
      batch,
      stdRegNumber: draft.stdRegNumber.trim(),
      firstName: draft.firstName.trim(),
      middleName: toNullable(draft.middleName),
      lastName: toNullable(draft.lastName),
      email: toNullable(draft.email),
      dateOfBirth: toNullable(draft.dateOfBirth),
      gender: (toNullable(draft.gender) as Gender | null) ?? null,
      cnic: toNullable(draft.cnic),
      profileImageUrl: toNullable(draft.profileImageUrl),
      phone: toNullable(draft.phone),
      address: toNullable(draft.address),
      city: toNullable(draft.city),
      guardianName: toNullable(draft.guardianName),
      guardianRelation: toNullable(draft.guardianRelation),
      guardianPhone: toNullable(draft.guardianPhone),
      guardianCnic: toNullable(draft.guardianCnic),
      admissionDate,
      status: "active",
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setStudents((prev) => [newStudent, ...prev]);
    setFeedback({
      type: "success",
      message: "Student enrolled successfully (local mock).",
    });
    setView("detail");
    setSelectedStudentId(newStudent.id);
    setStatusDraft("active");
  };

  const handleUpdate = () => {
    if (!selectedStudent) {
      setFeedback({ type: "error", message: "Student not found." });
      return;
    }

    const validation = validateCreateOrEdit("edit");
    if (!validation.ok) {
      setFeedback({ type: "error", message: validation.message });
      return;
    }

    const batch = MOCK_BATCHES.find((item) => item.id === draft.batchId);
    if (!batch) {
      setFeedback({ type: "error", message: "Batch not found." });
      return;
    }

    const updatedAt = new Date().toISOString();

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              batch,
              firstName: draft.firstName.trim(),
              middleName: toNullable(draft.middleName),
              lastName: toNullable(draft.lastName),
              email: toNullable(draft.email),
              dateOfBirth: toNullable(draft.dateOfBirth),
              gender: (toNullable(draft.gender) as Gender | null) ?? null,
              cnic: toNullable(draft.cnic),
              profileImageUrl: toNullable(draft.profileImageUrl),
              phone: toNullable(draft.phone),
              address: toNullable(draft.address),
              city: toNullable(draft.city),
              guardianName: toNullable(draft.guardianName),
              guardianRelation: toNullable(draft.guardianRelation),
              guardianPhone: toNullable(draft.guardianPhone),
              guardianCnic: toNullable(draft.guardianCnic),
              admissionDate:
                draft.admissionDate.trim() || student.admissionDate,
              updatedAt,
            }
          : student,
      ),
    );

    setFeedback({
      type: "success",
      message: "Student updated successfully (local mock).",
    });
    setView("detail");
  };

  const handleStatusUpdate = () => {
    if (!selectedStudent) {
      setFeedback({ type: "error", message: "Student not found." });
      return;
    }

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              status: statusDraft,
              updatedAt: new Date().toISOString(),
            }
          : student,
      ),
    );

    setFeedback({
      type: "success",
      message: "Student status updated successfully (local mock).",
    });
  };

  const handleBulkFile = (event: ChangeEvent<HTMLInputElement>) => {
    setBulkResult(null);
    const file = event.target.files?.[0] ?? null;
    setBulkFile(file);
  };

  const handleBulkProcess = (event: FormEvent) => {
    event.preventDefault();

    if (!bulkFile) {
      setFeedback({
        type: "error",
        message: "Please choose a .xlsx file before processing.",
      });
      return;
    }

    const filename = bulkFile.name.toLowerCase();
    if (!filename.endsWith(".xlsx")) {
      setFeedback({
        type: "error",
        message: "Only .xlsx files are supported.",
      });
      return;
    }

    const result: BulkResult = {
      totalRows: 12,
      successCount: bulkDryRun ? 10 : 11,
      failedCount: bulkDryRun ? 2 : 1,
      errors: bulkDryRun
        ? [
            {
              row: 4,
              stdRegNumber: "SP26-CS-004",
              errors: ["Student registration number already exists"],
            },
            {
              row: 7,
              stdRegNumber: null,
              errors: ["stdRegNumber is required"],
            },
          ]
        : [
            {
              row: 9,
              stdRegNumber: "SP26-CS-009",
              errors: ["Batch not found"],
            },
          ],
    };

    setBulkResult(result);
    setFeedback({
      type: "success",
      message: bulkDryRun
        ? "Dry-run complete (local simulation). No students were created."
        : "Bulk enrollment simulated (local). Backend integration can replace this handler later.",
    });
  };

  const downloadTemplate = () => {
    const headers = [
      "stdRegNumber",
      "firstName",
      "batchName",
      "batchId",
      "middleName",
      "lastName",
      "email",
      "dateOfBirth",
      "gender",
      "cnic",
      "phone",
      "address",
      "city",
      "guardianName",
      "guardianRelation",
      "guardianPhone",
      "guardianCnic",
      "admissionDate",
    ];

    const sample = [
      "SP26-CS-001",
      "Ali",
      "SP26",
      "",
      "Ahmed",
      "Khan",
      "ali.khan@example.com",
      "2007-04-15",
      "male",
      "35202-1234567-1",
      "03001234567",
      "House 12, Street 5",
      "Lahore",
      "Muhammad Khan",
      "Father",
      "03009876543",
      "35202-7654321-9",
      "2026-09-12",
    ];

    const csv = `${headers.join(",")}\n${sample.join(",")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "student_bulk_enrollment_template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if ((view === "detail" || view === "edit") && !selectedStudent) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="empty-note">Student not found.</p>
          <button
            type="button"
            className="btn secondary"
            onClick={resetListView}
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Student Management</h1>
          <div className="today">
            Manage Student enrollment, listing, profile updates,
            status updates, and bulk flow.
          </div>
        </div>
        <div className="inline-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => setView("bulk")}
          >
            Bulk Enrollment
          </button>
          <button type="button" className="btn" onClick={goToCreate}>
            + Register Student
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`notice ${feedback.type === "error" ? "error" : "success"}`}
        >
          {feedback.message}
        </div>
      )}

      {view === "list" && (
        <div className="card">
          <div className="tabs-row">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status.value}
                type="button"
                className={`tab-btn${statusFilter === status.value ? " active" : ""}`}
                onClick={() => {
                  setStatusFilter(status.value);
                  setPage(1);
                }}
              >
                {status.label}
              </button>
            ))}
          </div>

          <div className="card-body">
            <div className="toolbar-grid">
              <label className="field-label">
                Search
                <input
                  className="field-control"
                  type="search"
                  placeholder="Name, reg no, username, phone, email"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </label>

              <label className="field-label">
                Batch
                <select
                  className="field-control"
                  value={batchFilter}
                  onChange={(e) => {
                    setBatchFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All batches</option>
                  {MOCK_BATCHES.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-label narrow">
                Limit
                <select
                  className="field-control"
                  value={String(limit)}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </label>
            </div>
          </div>

          <div
            className="card-head"
            style={{
              borderTop: "1px solid var(--line)",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span className="meta">{listMetaText}</span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Reg. Number</th>
                  <th>Student</th>
                  <th className="col-hide-sm">Batch</th>
                  <th className="col-hide-sm">Phone</th>
                  <th className="col-hide-sm">Email</th>
                  <th>Status</th>
                  <th className="col-hide-sm">Admission Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="code">{student.stdRegNumber}</td>
                    <td>
                      <div className="subj-title">
                        {getDisplayName(student)}
                      </div>
                      <div className="subj-sub col-show-sm">
                        {student.batch.name}
                      </div>
                    </td>
                    <td className="subj-sub col-hide-sm">
                      {student.batch.name}
                    </td>
                    <td className="subj-sub col-hide-sm">
                      {student.phone ?? "—"}
                    </td>
                    <td className="subj-sub col-hide-sm">
                      {student.email ?? "—"}
                    </td>
                    <td>
                      <span
                        className={`status ${STATUS_CLASS[student.status]}`}
                      >
                        {toLabel(student.status)}
                      </span>
                    </td>
                    <td className="subj-sub col-hide-sm">
                      {student.admissionDate}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setStatusDraft(student.status);
                          setView("detail");
                          setFeedback(null);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        color: "var(--ink-faint)",
                        fontStyle: "italic",
                      }}
                    >
                      No students match the selected query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            className="card-body"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <div className="pager-row">
              <button
                type="button"
                className="btn secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <span className="meta">{listMetaText}</span>
              <button
                type="button"
                className="btn secondary"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "create" && (
        <StudentForm
          mode="create"
          values={draft}
          onChange={handleFormChange}
          onCancel={resetListView}
          onSubmit={handleCreate}
        />
      )}

      {view === "edit" && selectedStudent && (
        <>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-body">
              <span className="meta">
                Immutable fields: id, userId, stdRegNumber, username, status,
                password. Use dedicated status update below.
              </span>
            </div>
          </div>
          <StudentForm
            mode="edit"
            values={draft}
            onChange={handleFormChange}
            onCancel={() => setView("detail")}
            onSubmit={handleUpdate}
          />
        </>
      )}

      {view === "detail" && selectedStudent && (
        <>
          <div className="topbar" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="button"
                className="btn secondary"
                onClick={resetListView}
              >
                ← Back
              </button>
              <div>
                <h1 style={{ marginBottom: 2 }}>
                  {getDisplayName(selectedStudent)}
                </h1>
                <div className="today">
                  {selectedStudent.stdRegNumber} · {selectedStudent.batch.name}
                </div>
              </div>
            </div>
            <div className="inline-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={goToEdit}
              >
                Edit Profile
              </button>
              <span
                className={`status ${STATUS_CLASS[selectedStudent.status]}`}
              >
                {toLabel(selectedStudent.status)}
              </span>
            </div>
          </div>

          <div className="profile-grid">
            <div className="card">
              <div className="card-head">
                <h2>Personal Information</h2>
              </div>
              <div className="profile-fields">
                {[
                  { label: "First Name", value: selectedStudent.firstName },
                  {
                    label: "Middle Name",
                    value: selectedStudent.middleName ?? "—",
                  },
                  {
                    label: "Last Name",
                    value: selectedStudent.lastName ?? "—",
                  },
                  { label: "Email", value: selectedStudent.email ?? "—" },
                  { label: "Phone", value: selectedStudent.phone ?? "—" },
                  {
                    label: "Date of Birth",
                    value: selectedStudent.dateOfBirth ?? "—",
                  },
                  { label: "Gender", value: selectedStudent.gender ?? "—" },
                  { label: "CNIC", value: selectedStudent.cnic ?? "—" },
                  {
                    label: "Profile Image URL",
                    value: selectedStudent.profileImageUrl ?? "—",
                  },
                ].map((item) => (
                  <div className="profile-field" key={item.label}>
                    <div className="profile-field__label">{item.label}</div>
                    <div className="profile-field__value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Enrollment Information</h2>
              </div>
              <div className="profile-fields">
                {[
                  { label: "Student ID", value: selectedStudent.id },
                  { label: "User ID", value: selectedStudent.userId },
                  { label: "Username", value: selectedStudent.username },
                  {
                    label: "Registration Number",
                    value: selectedStudent.stdRegNumber,
                  },
                  {
                    label: "Batch",
                    value: `${selectedStudent.batch.name} (${selectedStudent.batch.id})`,
                  },
                  {
                    label: "Admission Date",
                    value: selectedStudent.admissionDate,
                  },
                  { label: "Status", value: toLabel(selectedStudent.status) },
                  { label: "Created At", value: selectedStudent.createdAt },
                  { label: "Updated At", value: selectedStudent.updatedAt },
                ].map((item) => (
                  <div className="profile-field" key={item.label}>
                    <div className="profile-field__label">{item.label}</div>
                    <div className="profile-field__value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Guardian Information</h2>
              </div>
              <div className="profile-fields">
                {[
                  {
                    label: "Guardian Name",
                    value: selectedStudent.guardianName ?? "—",
                  },
                  {
                    label: "Relation",
                    value: selectedStudent.guardianRelation ?? "—",
                  },
                  {
                    label: "Guardian Phone",
                    value: selectedStudent.guardianPhone ?? "—",
                  },
                  {
                    label: "Guardian CNIC",
                    value: selectedStudent.guardianCnic ?? "—",
                  },
                  { label: "Address", value: selectedStudent.address ?? "—" },
                  { label: "City", value: selectedStudent.city ?? "—" },
                ].map((item) => (
                  <div className="profile-field" key={item.label}>
                    <div className="profile-field__label">{item.label}</div>
                    <div className="profile-field__value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Update Status</h2>
              </div>
              <div className="card-body">
                <div className="toolbar-grid">
                  <label className="field-label narrow">
                    New Status
                    <select
                      className="field-control"
                      value={statusDraft}
                      onChange={(e) =>
                        setStatusDraft(e.target.value as StudentStatus)
                      }
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="graduated">graduated</option>
                    </select>
                  </label>
                </div>
                <div className="action-row" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleStatusUpdate}
                  >
                    Apply Status
                  </button>
                  <span className="meta">
                    Maps to PATCH /api/students/:id/status
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {view === "bulk" && (
        <div className="card">
          <div
            className="card-head"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            <h2>Bulk Enrollment</h2>
            <span className="meta">
              API-ready flow for POST /api/students/bulk and template endpoint
            </span>
          </div>
          <div className="card-body">
            <form onSubmit={handleBulkProcess}>
              <div className="toolbar-grid">
                <label className="field-label span-2">
                  Upload .xlsx file
                  <input
                    className="field-control"
                    type="file"
                    accept=".xlsx"
                    onChange={handleBulkFile}
                  />
                </label>

                <label
                  className="field-label narrow"
                  style={{ justifyContent: "center" }}
                >
                  <span>Dry Run</span>
                  <input
                    type="checkbox"
                    checked={bulkDryRun}
                    onChange={(e) => setBulkDryRun(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: 8 }}
                  />
                </label>
              </div>

              <div className="action-row" style={{ marginTop: 14 }}>
                <button type="submit" className="btn">
                  {bulkDryRun
                    ? "Run Validation (Dry Run)"
                    : "Process Bulk Enrollment"}
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={downloadTemplate}
                >
                  Download Local Template
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={resetListView}
                >
                  Back to List
                </button>
              </div>
            </form>

            {bulkResult && (
              <div className="bulk-result">
                <h3 style={{ marginTop: 0 }}>Bulk Result</h3>
                <p className="meta" style={{ margin: "0 0 8px" }}>
                  totalRows: {bulkResult.totalRows} · successCount:{" "}
                  {bulkResult.successCount} · failedCount:{" "}
                  {bulkResult.failedCount}
                </p>
                {bulkResult.errors.length > 0 && (
                  <ul className="bulk-errors">
                    {bulkResult.errors.map((error) => (
                      <li key={`${error.row}-${error.stdRegNumber ?? "none"}`}>
                        Row {error.row}
                        {error.stdRegNumber
                          ? ` (${error.stdRegNumber})`
                          : ""}: {error.errors.join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default StudentManagementPage;
