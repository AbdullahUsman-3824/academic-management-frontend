import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Gender } from "../../api/students";
import { useBatches } from "../../hooks/useAcademicQueries";
import {
  useBulkEnrollStudents,
  useCreateStudent,
  useDownloadBulkTemplate,
  useStudent,
  useStudents,
  useUpdateStudent,
  useUpdateStudentStatus,
} from "../../hooks/useStudentQueries";
import type { StudentStatus } from "../../hooks/useStudentQueries";
import { StudentForm } from "./StudentForm";
import {
  extractErrorMessage,
  getDisplayName,
  toLabel,
  toNullable,
  toStudentFormValues,
} from "./student.helpers";
import {
  EMPTY_FORM,
  STATUS_CLASS,
  STATUS_FILTERS,
} from "./student.types";
import type { PageView, StudentFormValues } from "./student.types";

function StudentManagementPage() {
  // ── Navigation ─────────────────────────────────────────────────────────────
  const [view, setView] = useState<PageView>("list");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // ── List filters / pagination ──────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentStatus>("all");
  const [batchFilter, setBatchFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ── Form / bulk state ──────────────────────────────────────────────────────
  const [draft, setDraft] = useState<StudentFormValues>(EMPTY_FORM);
  const [statusDraft, setStatusDraft] = useState<StudentStatus>("active");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkDryRun, setBulkDryRun] = useState(true);

  // ── Feedback banner ────────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const listParams = {
    page,
    limit,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(batchFilter ? { batchId: batchFilter } : {}),
  };

  const { data: listData, isLoading: listLoading, isError: listError } =
    useStudents(listParams);

  const { data: selectedStudent, isLoading: detailLoading } = useStudent(
    view === "detail" || view === "edit" ? selectedStudentId : null,
  );

  const { data: batchesData, isLoading: batchesLoading } = useBatches();
  const batches = batchesData ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const statusMutation = useUpdateStudentStatus();
  const bulkMutation = useBulkEnrollStudents();
  const templateMutation = useDownloadBulkTemplate();

  // ── Derived list values ────────────────────────────────────────────────────
  const students = listData?.data ?? [];
  const meta = listData?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? page;
  const listMetaText = `Page ${currentPage} of ${totalPages} · ${total} result${total === 1 ? "" : "s"}`;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFormChange = (field: keyof StudentFormValues, value: string) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const resetListView = () => {
    setView("list");
    setSelectedStudentId(null);
    setFeedback(null);
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

  const validateForm = (
    mode: "create" | "edit",
  ): { ok: true } | { ok: false; message: string } => {
    if (!draft.batchId.trim()) return { ok: false, message: "Batch is required." };
    if (!draft.firstName.trim()) return { ok: false, message: "First name is required." };
    if (mode === "create" && !draft.stdRegNumber.trim())
      return { ok: false, message: "Registration number is required." };
    return { ok: true };
  };

  const draftToDto = () => ({
    batchId: draft.batchId || undefined,
    firstName: draft.firstName.trim() || undefined,
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
    admissionDate: toNullable(draft.admissionDate),
  });

  const handleCreate = () => {
    const v = validateForm("create");
    if (!v.ok) { setFeedback({ type: "error", message: v.message }); return; }

    createMutation.mutate(
      { ...draftToDto(), batchId: draft.batchId, stdRegNumber: draft.stdRegNumber.trim(), firstName: draft.firstName.trim() },
      {
        onSuccess: (created) => {
          setFeedback({ type: "success", message: "Student enrolled successfully." });
          setSelectedStudentId(created.id);
          setStatusDraft(created.status);
          setView("detail");
        },
        onError: (err) =>
          setFeedback({ type: "error", message: extractErrorMessage(err, "Failed to enroll student.") }),
      },
    );
  };

  const handleUpdate = () => {
    if (!selectedStudentId) return;
    const v = validateForm("edit");
    if (!v.ok) { setFeedback({ type: "error", message: v.message }); return; }

    updateMutation.mutate(
      { id: selectedStudentId, dto: draftToDto() },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Student updated successfully." });
          setView("detail");
        },
        onError: (err) =>
          setFeedback({ type: "error", message: extractErrorMessage(err, "Failed to update student.") }),
      },
    );
  };

  const handleStatusUpdate = () => {
    if (!selectedStudentId) return;
    statusMutation.mutate(
      { id: selectedStudentId, dto: { status: statusDraft } },
      {
        onSuccess: () =>
          setFeedback({ type: "success", message: "Student status updated successfully." }),
        onError: (err) =>
          setFeedback({ type: "error", message: extractErrorMessage(err, "Failed to update status.") }),
      },
    );
  };

  const handleBulkFile = (e: ChangeEvent<HTMLInputElement>) => {
    setBulkFile(e.target.files?.[0] ?? null);
    bulkMutation.reset();
  };

  const handleBulkProcess = (e: FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      setFeedback({ type: "error", message: "Please choose a .xlsx file before processing." });
      return;
    }
    if (!bulkFile.name.toLowerCase().endsWith(".xlsx")) {
      setFeedback({ type: "error", message: "Only .xlsx files are supported." });
      return;
    }
    setFeedback(null);
    bulkMutation.mutate(
      { file: bulkFile, dryRun: bulkDryRun },
      {
        onSuccess: (result) =>
          setFeedback({
            type: "success",
            message: bulkDryRun
              ? `Dry-run complete. ${result.successCount} rows valid, ${result.failedCount} errors. No students were created.`
              : `Bulk enrollment complete. ${result.successCount} enrolled, ${result.failedCount} failed.`,
          }),
        onError: (err) =>
          setFeedback({ type: "error", message: extractErrorMessage(err, "Bulk enrollment failed.") }),
      },
    );
  };

  const handleDownloadTemplate = () => {
    templateMutation.mutate(undefined, {
      onError: (err) =>
        setFeedback({ type: "error", message: extractErrorMessage(err, "Failed to download template.") }),
    });
  };

  // ── Detail / edit loading guard ────────────────────────────────────────────
  if (view === "detail" || view === "edit") {
    if (detailLoading) {
      return (
        <div className="card">
          <div className="card-body">
            <p className="meta">Loading student…</p>
          </div>
        </div>
      );
    }
    if (!selectedStudent) {
      return (
        <div className="card">
          <div className="card-body">
            <p className="empty-note">Student not found.</p>
            <button type="button" className="btn secondary" onClick={resetListView}>
              Back to list
            </button>
          </div>
        </div>
      );
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Top bar */}
      <div className="topbar">
        <div>
          <h1>Student Management</h1>
          <div className="today">
            Manage student enrollment, profiles, status updates, and bulk imports.
          </div>
        </div>
        <div className="inline-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => { setFeedback(null); setView("bulk"); }}
          >
            Bulk Enrollment
          </button>
          <button type="button" className="btn" onClick={goToCreate}>
            + Register Student
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`notice ${feedback.type === "error" ? "error" : "success"}`}>
          {feedback.message}
        </div>
      )}

      {/* ── LIST ── */}
      {view === "list" && (
        <div className="card">
          <div className="tabs-row">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.value}
                type="button"
                className={`tab-btn${statusFilter === sf.value ? " active" : ""}`}
                onClick={() => { setStatusFilter(sf.value); setPage(1); }}
              >
                {sf.label}
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
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </label>

              <label className="field-label">
                Batch
                <select
                  className="field-control"
                  value={batchFilter}
                  onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }}
                  disabled={batchesLoading}
                >
                  <option value="">All batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </label>

              <label className="field-label narrow">
                Limit
                <select
                  className="field-control"
                  value={String(limit)}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
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
            style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
          >
            <span className="meta">
              {listLoading ? "Loading…" : listError ? "Failed to load students." : listMetaText}
            </span>
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
                {listLoading && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", color: "var(--ink-faint)", fontStyle: "italic" }}>
                      Loading students…
                    </td>
                  </tr>
                )}
                {!listLoading && listError && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", color: "var(--ink-faint)", fontStyle: "italic" }}>
                      Failed to load students. Please try again.
                    </td>
                  </tr>
                )}
                {!listLoading && !listError && students.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", color: "var(--ink-faint)", fontStyle: "italic" }}>
                      No students match the selected query.
                    </td>
                  </tr>
                )}
                {!listLoading && students.map((student) => (
                  <tr key={student.id}>
                    <td className="code">{student.stdRegNumber}</td>
                    <td>
                      <div className="subj-title">{getDisplayName(student)}</div>
                      <div className="subj-sub col-show-sm">{student.batch.name}</div>
                    </td>
                    <td className="subj-sub col-hide-sm">{student.batch.name}</td>
                    <td className="subj-sub col-hide-sm">{student.phone ?? "—"}</td>
                    <td className="subj-sub col-hide-sm">{student.email ?? "—"}</td>
                    <td>
                      <span className={`status ${STATUS_CLASS[student.status]}`}>
                        {toLabel(student.status)}
                      </span>
                    </td>
                    <td className="subj-sub col-hide-sm">{student.admissionDate}</td>
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
              </tbody>
            </table>
          </div>

          <div className="card-body" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="pager-row">
              <button
                type="button"
                className="btn secondary"
                disabled={currentPage <= 1 || listLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="meta">{listLoading ? "…" : listMetaText}</span>
              <button
                type="button"
                className="btn secondary"
                disabled={currentPage >= totalPages || listLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE ── */}
      {view === "create" && (
        <StudentForm
          mode="create"
          values={draft}
          batches={batches}
          batchesLoading={batchesLoading}
          onChange={handleFormChange}
          onCancel={resetListView}
          onSubmit={handleCreate}
          submitting={createMutation.isPending}
        />
      )}

      {/* ── EDIT ── */}
      {view === "edit" && selectedStudent && (
        <>
          <StudentForm
            mode="edit"
            values={draft}
            batches={batches}
            batchesLoading={batchesLoading}
            onChange={handleFormChange}
            onCancel={() => setView("detail")}
            onSubmit={handleUpdate}
            submitting={updateMutation.isPending}
          />
        </>
      )}

      {/* ── DETAIL ── */}
      {view === "detail" && selectedStudent && (
        <>
          <div className="topbar" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button type="button" className="btn secondary" onClick={resetListView}>
                ← Back
              </button>
              <div>
                <h1 style={{ marginBottom: 2 }}>{getDisplayName(selectedStudent)}</h1>
                <div className="today">
                  {selectedStudent.stdRegNumber} · {selectedStudent.batch.name}
                </div>
              </div>
            </div>
            <div className="inline-actions">
              <button type="button" className="btn secondary" onClick={goToEdit}>
                Edit Profile
              </button>
              <span className={`status ${STATUS_CLASS[selectedStudent.status]}`}>
                {toLabel(selectedStudent.status)}
              </span>
            </div>
          </div>

          <div className="profile-grid">
            <div className="card">
              <div className="card-head"><h2>Personal Information</h2></div>
              <div className="profile-fields">
                {(
                  [
                    ["First Name", selectedStudent.firstName],
                    ["Middle Name", selectedStudent.middleName ?? "—"],
                    ["Last Name", selectedStudent.lastName ?? "—"],
                    ["Email", selectedStudent.email ?? "—"],
                    ["Phone", selectedStudent.phone ?? "—"],
                    ["Date of Birth", selectedStudent.dateOfBirth ?? "—"],
                    ["Gender", selectedStudent.gender ?? "—"],
                    ["CNIC", selectedStudent.cnic ?? "—"],
                    ["Profile Image URL", selectedStudent.profileImageUrl ?? "—"],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div className="profile-field" key={label}>
                    <div className="profile-field__label">{label}</div>
                    <div className="profile-field__value">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h2>Enrollment Information</h2></div>
              <div className="profile-fields">
                {(
                  [
                    ["Student ID", selectedStudent.id],
                    ["User ID", selectedStudent.userId],
                    ["Username", selectedStudent.username],
                    ["Registration Number", selectedStudent.stdRegNumber],
                    ["Batch", `${selectedStudent.batch.name} (${selectedStudent.batch.id})`],
                    ["Admission Date", selectedStudent.admissionDate],
                    ["Status", toLabel(selectedStudent.status)],
                    ["Created At", selectedStudent.createdAt],
                    ["Updated At", selectedStudent.updatedAt],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div className="profile-field" key={label}>
                    <div className="profile-field__label">{label}</div>
                    <div className="profile-field__value">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h2>Guardian Information</h2></div>
              <div className="profile-fields">
                {(
                  [
                    ["Guardian Name", selectedStudent.guardianName ?? "—"],
                    ["Relation", selectedStudent.guardianRelation ?? "—"],
                    ["Guardian Phone", selectedStudent.guardianPhone ?? "—"],
                    ["Guardian CNIC", selectedStudent.guardianCnic ?? "—"],
                    ["Address", selectedStudent.address ?? "—"],
                    ["City", selectedStudent.city ?? "—"],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div className="profile-field" key={label}>
                    <div className="profile-field__label">{label}</div>
                    <div className="profile-field__value">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h2>Update Status</h2></div>
              <div className="card-body">
                <div className="toolbar-grid">
                  <label className="field-label narrow">
                    New Status
                    <select
                      className="field-control"
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value as StudentStatus)}
                      disabled={statusMutation.isPending}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                    </select>
                  </label>
                </div>
                <div className="action-row" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleStatusUpdate}
                    disabled={statusMutation.isPending || statusDraft === selectedStudent.status}
                  >
                    {statusMutation.isPending ? "Applying…" : "Apply Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── BULK ── */}
      {view === "bulk" && (
        <div className="card">
          <div className="card-head" style={{ borderBottom: "1px solid var(--line)" }}>
            <h2>Bulk Enrollment</h2>
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
                    disabled={bulkMutation.isPending}
                  />
                </label>

                <label className="field-label narrow" style={{ justifyContent: "center" }}>
                  <span>Dry Run</span>
                  <input
                    type="checkbox"
                    checked={bulkDryRun}
                    onChange={(e) => setBulkDryRun(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: 8 }}
                    disabled={bulkMutation.isPending}
                  />
                </label>
              </div>

              <div className="action-row" style={{ marginTop: 14 }}>
                <button type="submit" className="btn" disabled={bulkMutation.isPending}>
                  {bulkMutation.isPending
                    ? "Processing…"
                    : bulkDryRun ? "Run Validation (Dry Run)" : "Process Bulk Enrollment"}
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleDownloadTemplate}
                  disabled={templateMutation.isPending}
                >
                  {templateMutation.isPending ? "Downloading…" : "Download Template"}
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={resetListView}
                  disabled={bulkMutation.isPending}
                >
                  Back to List
                </button>
              </div>
            </form>

            {bulkMutation.data && (
              <div className="bulk-result">
                <h3 style={{ marginTop: 0 }}>Bulk Result</h3>
                <p className="meta" style={{ margin: "0 0 8px" }}>
                  totalRows: {bulkMutation.data.totalRows} · successCount:{" "}
                  {bulkMutation.data.successCount} · failedCount:{" "}
                  {bulkMutation.data.failedCount}
                </p>
                {bulkMutation.data.errors.length > 0 && (
                  <ul className="bulk-errors">
                    {bulkMutation.data.errors.map((err) => (
                      <li key={`${err.row}-${err.stdRegNumber ?? "none"}`}>
                        Row {err.row}{err.stdRegNumber ? ` (${err.stdRegNumber})` : ""}: {err.errors.join(", ")}
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
