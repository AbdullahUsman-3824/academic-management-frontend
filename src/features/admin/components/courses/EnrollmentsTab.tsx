import { useState } from "react";
import {
  useEnrollments,
  useUpdateEnrollmentStatus,
  useDropEnrollment,
  useDeleteEnrollment,
} from "../../hooks/useEnrollmentQueries";
import { useBatches, useSections } from "../../hooks/useAcademicQueries";
import type { EnrollmentStatus } from "../../../../api/enrollments";
import EnrollmentForm from "./EnrollmentForm";
import BulkReEnrollModal from "./BulkReEnrollModal";

const statusClass: Record<EnrollmentStatus, string> = {
  enrolled: "active",
  completed: "active",
  dropped: "inactive",
  failed: "inactive",
  reappear: "inactive",
};

export default function EnrollmentsTab() {
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "all">(
    "all",
  );
  const [showForm, setShowForm] = useState(false);
  const [showBulkReEnroll, setShowBulkReEnroll] = useState(false);

  // Search filters
  const [batchFilter, setBatchFilter] = useState<string>("");
  const [sectionFilter, setSectionFilter] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch batches for filter
  const { data: batches } = useBatches();

  // Fetch sections when batch is selected
  const { data: sections } = useSections(batchFilter || null);

  // Fetch enrollments with pagination
  const {
    data: enrollmentsResult,
    isLoading,
    error,
    refetch,
  } = useEnrollments({
    status: statusFilter !== "all" ? statusFilter : undefined,
    batchId: batchFilter || undefined,
    sectionId: sectionFilter || undefined,
    search: appliedSearch || undefined,
    page,
    limit: 20,
  });

  const updateStatusMutation = useUpdateEnrollmentStatus();
  const dropMutation = useDropEnrollment();
  const deleteMutation = useDeleteEnrollment();

  const handleUpdateStatus = async (id: string, status: EnrollmentStatus) => {
    if (!confirm(`Change status to ${status}?`)) return;
    await updateStatusMutation.mutateAsync({ id, payload: { status } });
  };

  const handleDrop = async (id: string) => {
    if (!confirm("Drop this course enrollment?")) return;
    await dropMutation.mutateAsync(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this enrollment?")) return;
    await deleteMutation.mutateAsync(id);
  };

  const handleSearch = () => {
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  const enrollments = enrollmentsResult?.data || [];
  const pagination = enrollmentsResult?.pagination;

  const statuses: (EnrollmentStatus | "all")[] = [
    "all",
    "enrolled",
    "completed",
    "dropped",
    "failed",
    "reappear",
  ];

  return (
    <>
      <div className="tabs-row" style={{ borderTop: "1px solid var(--line)" }}>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            className={`tab-btn${statusFilter === s ? " active" : ""}`}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div
        className="card-head"
        style={{ borderTop: "none", borderBottom: "1px solid var(--line)" }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            flex: 1,
          }}
        >
          <select
            value={batchFilter}
            onChange={(e) => {
              setBatchFilter(e.target.value);
              setSectionFilter("");
              setPage(1);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 5,
              border: "1px solid var(--line)",
              fontSize: 13,
              minWidth: 150,
            }}
          >
            <option value="">Select Batch *</option>
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id}>
                Batch {batch.name}
              </option>
            ))}
          </select>

          {batchFilter && (
            <select
              value={sectionFilter}
              onChange={(e) => {
                setSectionFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 5,
                border: "1px solid var(--line)",
                fontSize: 13,
                minWidth: 150,
              }}
            >
              <option value="">All Sections</option>
              {sections?.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          )}

          {batchFilter && (
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Search by reg no, name, or CNIC..."
              style={{
                padding: "6px 10px",
                borderRadius: 5,
                border: "1px solid var(--line)",
                fontSize: 13,
                minWidth: 200,
                flex: 1,
              }}
            />
          )}

          {batchFilter && (
            <button
              type="button"
              className="btn"
              onClick={handleSearch}
              disabled={isLoading}
              style={{ padding: "6px 16px" }}
            >
              Search
            </button>
          )}

          {appliedSearch && (
            <button
              type="button"
              className="btn secondary"
              onClick={handleClearSearch}
              style={{ padding: "6px 12px" }}
            >
              Clear
            </button>
          )}

          <button
            type="button"
            className="btn secondary"
            onClick={() => setShowBulkReEnroll(true)}
            style={{ marginLeft: "auto" }}
            title="Enroll students with missing course enrollments"
          >
            🔄 Bulk Re-enroll
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => setShowForm(true)}
          >
            + New Enrollment
          </button>
        </div>
      </div>

      {error && (
        <div
          className="card-body"
          style={{
            padding: 16,
            backgroundColor: "#fee",
            border: "1px solid #f88",
          }}
        >
          <p style={{ color: "#d00", margin: 0 }}>
            <strong>Error:</strong>{" "}
            {(error as any)?.response?.data?.message ||
              (error as Error).message}
          </p>
        </div>
      )}

      <div
        className="card-head"
        style={{ borderTop: "none", borderBottom: "1px solid var(--line)" }}
      >
        <span className="meta">
          {isLoading
            ? "Loading..."
            : pagination
              ? `${pagination.total} enrollment${pagination.total !== 1 ? "s" : ""} (Page ${pagination.page} of ${pagination.totalPages})`
              : "Select batch to view enrollments"}
        </span>
        <button
          type="button"
          className="btn secondary"
          onClick={() => refetch()}
          disabled={!batchFilter || isLoading}
        >
          Refresh
        </button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Batch</th>
              <th>Course</th>
              <th className="col-hide-sm">Credits</th>
              <th>Status</th>
              <th className="col-hide-sm">Enrolled Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!batchFilter ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    color: "var(--ink-faint)",
                    padding: "40px 16px",
                    fontStyle: "italic",
                  }}
                >
                  Please select a batch to view enrollments
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", color: "var(--ink-faint)" }}
                >
                  Loading enrollments...
                </td>
              </tr>
            ) : !enrollments || enrollments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    color: "var(--ink-faint)",
                    fontStyle: "italic",
                  }}
                >
                  {appliedSearch
                    ? "No matching enrollments found"
                    : "No enrollments found for this batch"}
                </td>
              </tr>
            ) : (
              enrollments.map((enr) => (
                <tr key={enr.id}>
                  <td>
                    <div className="subj-title">
                      {enr.studentAcademicRecord?.student?.firstName}
                    </div>
                    <div className="subj-sub">
                      {enr.studentAcademicRecord?.student?.studentNumber}
                    </div>
                  </td>
                  <td>
                    <div className="subj-sub">
                      {enr.studentAcademicRecord?.student?.batch?.name || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div className="subj-title">{enr.course?.code}</div>
                    <div className="subj-sub col-hide-sm">
                      {enr.course?.name}
                    </div>
                    {/* {enr.isExtra && enr.allocation && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6c757d",
                          marginTop: 4,
                        }}
                      >
                        📚 Extra • Batch {enr.allocation.section?.batch?.name} -
                        Sec {enr.allocation.section?.name}
                      </div>
                    )} */}
                  </td>
                  <td className="subj-sub col-hide-sm">
                    {enr.course?.creditHours}
                    {enr.isExtra && (
                      <span
                        style={{
                          marginLeft: 4,
                          fontSize: 11,
                          color: "var(--ink-faint)",
                        }}
                      >
                        (Extra)
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status ${statusClass[enr.status]}`}>
                      {enr.status}
                    </span>
                  </td>
                  <td className="subj-sub col-hide-sm">
                    {new Date(enr.enrolledAt).toLocaleDateString()}
                  </td>
                  <td>
                    <select
                      value="actions"
                      onChange={(e) => {
                        const action = e.target.value;
                        if (action === "drop") {
                          handleDrop(enr.id);
                        } else if (action === "delete") {
                          handleDelete(enr.id);
                        } else if (
                          action === "enrolled" ||
                          action === "completed" ||
                          action === "failed" ||
                          action === "reappear"
                        ) {
                          handleUpdateStatus(
                            enr.id,
                            action as EnrollmentStatus,
                          );
                        }
                        e.target.value = "actions";
                      }}
                      style={{
                        padding: "4px 8px",
                        fontSize: 12,
                        border: "1px solid var(--line)",
                        borderRadius: 4,
                      }}
                    >
                      <option value="actions">Actions</option>
                      <option value="enrolled">Mark Enrolled</option>
                      <option value="completed">Mark Completed</option>
                      <option value="failed">Mark Failed</option>
                      <option value="reappear">Mark Reappear</option>
                      <option value="drop">Drop Course</option>
                      <option value="delete">Delete</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div
          className="card-head"
          style={{
            borderTop: "1px solid var(--line)",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <button
            type="button"
            className="btn secondary"
            disabled={page === 1 || isLoading}
            onClick={() => setPage(page - 1)}
            style={{ padding: "4px 12px", fontSize: 13 }}
          >
            ← Previous
          </button>
          <span className="meta">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="btn secondary"
            disabled={page === pagination.totalPages || isLoading}
            onClick={() => setPage(page + 1)}
            style={{ padding: "4px 12px", fontSize: 13 }}
          >
            Next →
          </button>
        </div>
      )}

      {showForm && <EnrollmentForm onClose={() => setShowForm(false)} />}
      {showBulkReEnroll && (
        <BulkReEnrollModal onClose={() => setShowBulkReEnroll(false)} />
      )}
    </>
  );
}
