import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  useBatches,
  useEnrollmentSections,
  useMoveStudentsSection,
} from "../../hooks/useAcademicQueries";
import {
  useBulkEnrollStudents,
  useDownloadBulkTemplate,
  useStudents,
} from "../../hooks/useStudentQueries";
import type { StudentStatus } from "../../hooks/useStudentQueries";
import { StudentTable } from "../../components/student/StudentTable";
import { extractErrorMessage } from "../../helpers/student.helpers";
import { STATUS_FILTERS } from "../../types/student.types";
import { adminPaths } from "../../data/navData";

function StudentsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentStatus>(
    "all",
  );
  const [batchFilter, setBatchFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showBulk, setShowBulk] = useState(false);

  // ── Bulk "move to section" state ────────────────────────────────────────────
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveTargetSectionId, setMoveTargetSectionId] = useState("");

  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkDryRun, setBulkDryRun] = useState(true);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const listParams = {
    page,
    limit,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(batchFilter ? { batchId: batchFilter } : {}),
  };

  const {
    data: listData,
    isLoading: listLoading,
    isError: listError,
  } = useStudents(listParams);

  const { data: batchesData, isLoading: batchesLoading } = useBatches();
  const batches = batchesData ?? [];

  // Sections for the CURRENT BATCH FILTER — used by the Move-to-Section modal.
  // moveStudents is batch-scoped on the backend, so bulk moves only make
  // sense once a specific batch is selected in the filter.
  const { data: moveSectionsData, isLoading: moveSectionsLoading } =
    useEnrollmentSections(selectMode && batchFilter ? batchFilter : null);
  const moveSections = moveSectionsData ?? [];

  const bulkMutation = useBulkEnrollStudents();
  const templateMutation = useDownloadBulkTemplate();
  const moveMutation = useMoveStudentsSection();

  const students = listData?.data ?? [];
  const meta = listData?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? page;
  const listMetaText = `Page ${currentPage} of ${totalPages} · ${total} result${total === 1 ? "" : "s"}`;

  // Selecting students only makes sense scoped to one batch (move-students
  // requires it) — clear selection if the batch filter or page changes.
  useEffect(() => {
    setSelectedIds(new Set());
    setLastClickedIndex(null);
  }, [batchFilter, page]);

  const handleBulkFile = (e: ChangeEvent<HTMLInputElement>) => {
    setBulkFile(e.target.files?.[0] ?? null);
    bulkMutation.reset();
  };

  const handleBulkProcess = (e: FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      setFeedback({
        type: "error",
        message: "Please choose a .xlsx file before processing.",
      });
      return;
    }
    if (!bulkFile.name.toLowerCase().endsWith(".xlsx")) {
      setFeedback({
        type: "error",
        message: "Only .xlsx files are supported.",
      });
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
          setFeedback({
            type: "error",
            message: extractErrorMessage(err, "Bulk enrollment failed."),
          }),
      },
    );
  };

  const handleDownloadTemplate = () => {
    templateMutation.mutate(undefined, {
      onError: (err) =>
        setFeedback({
          type: "error",
          message: extractErrorMessage(err, "Failed to download template."),
        }),
    });
  };

  // ── Bulk select handlers ─────────────────────────────────────────────────────
  const toggleOne = (id: string, index: number, shiftKey: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (shiftKey && lastClickedIndex !== null) {
        const [from, to] = [lastClickedIndex, index].sort((a, b) => a - b);
        const shouldSelect = !prev.has(id); // mirror the clicked checkbox's new state
        for (let i = from; i <= to; i++) {
          const rowId = students[i]?.id;
          if (!rowId) continue;
          if (shouldSelect) next.add(rowId);
          else next.delete(rowId);
        }
      } else {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      return next;
    });
    setLastClickedIndex(index);
  };

  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      const allSelected = students.every((s) => prev.has(s.id));
      const next = new Set(prev);
      for (const s of students) {
        if (allSelected) next.delete(s.id);
        else next.add(s.id);
      }
      return next;
    });
  };

  const handleMoveSubmit = () => {
    if (!batchFilter || !moveTargetSectionId || selectedIds.size === 0) return;
    moveMutation.mutate(
      {
        batchId: batchFilter,
        dto: {
          studentIds: Array.from(selectedIds),
          targetSectionId: moveTargetSectionId,
        },
      },
      {
        onSuccess: (res) => {
          setFeedback({
            type: "success",
            message: `${res.movedCount} student(s) moved to section ${res.targetSection.name}.`,
          });
          setSelectedIds(new Set());
          setMoveModalOpen(false);
          setMoveTargetSectionId("");
        },
        onError: (err) =>
          setFeedback({
            type: "error",
            message: extractErrorMessage(err, "Failed to move students."),
          }),
      },
    );
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Student Management</h1>
          <div className="today">
            Manage student enrollment, profiles, status updates, and bulk
            imports.
          </div>
        </div>
        <div className="inline-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setFeedback(null);
              setShowBulk((v) => !v);
            }}
          >
            {showBulk ? "Hide Bulk Enrollment" : "Bulk Enrollment"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate(adminPaths.studentNew)}
          >
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

      {/* ── BULK ENROLLMENT PANEL ── */}
      {showBulk && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div
            className="card-head"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
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
                    disabled={bulkMutation.isPending}
                  />
                </label>
              </div>

              <div className="action-row" style={{ marginTop: 14 }}>
                <button
                  type="submit"
                  className="btn"
                  disabled={bulkMutation.isPending}
                >
                  {bulkMutation.isPending
                    ? "Processing…"
                    : bulkDryRun
                      ? "Run Validation (Dry Run)"
                      : "Process Bulk Enrollment"}
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleDownloadTemplate}
                  disabled={templateMutation.isPending}
                >
                  {templateMutation.isPending
                    ? "Downloading…"
                    : "Download Template"}
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
                        Row {err.row}
                        {err.stdRegNumber ? ` (${err.stdRegNumber})` : ""}:{" "}
                        {err.errors.join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LIST ── */}
      <div className="card">
        <div className="tabs-row">
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.value}
              type="button"
              className={`tab-btn${statusFilter === sf.value ? " active" : ""}`}
              onClick={() => {
                setStatusFilter(sf.value);
                setPage(1);
              }}
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
                  setSelectMode(false);
                }}
                disabled={batchesLoading}
              >
                <option value="">All batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
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

            <label
              className="field-label narrow"
              style={{ justifyContent: "flex-end" }}
            >
              <span style={{ visibility: "hidden" }}>Move</span>
              <button
                type="button"
                className="btn secondary"
                disabled={!batchFilter}
                title={
                  !batchFilter
                    ? "Select a specific batch to enable bulk section moves"
                    : undefined
                }
                onClick={() => {
                  setSelectMode((v) => !v);
                  setSelectedIds(new Set());
                }}
              >
                {selectMode ? "Cancel Select" : "Update Sections"}
              </button>
            </label>
          </div>

          {!batchFilter && (
            <p
              style={{
                fontSize: 12,
                color: "var(--ink-faint)",
                marginTop: 8,
              }}
            >
              Select a specific batch above to enable bulk section moves.
            </p>
          )}
        </div>

        <div
          className="card-head"
          style={{
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <span className="meta">
            {listLoading
              ? "Loading…"
              : listError
                ? "Failed to load students."
                : listMetaText}
          </span>
          {selectMode && selectedIds.size > 0 && (
            <button
              type="button"
              className="btn"
              style={{ padding: "4px 12px", fontSize: 12 }}
              onClick={() => setMoveModalOpen(true)}
            >
              Move {selectedIds.size} to Section…
            </button>
          )}
        </div>

        <StudentTable
          students={students}
          loading={listLoading}
          error={listError}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onToggleOne={toggleOne}
          onToggleAll={toggleAllOnPage}
          onView={(id) => navigate(adminPaths.studentView(id))}
        />

        <div
          className="card-body"
          style={{ borderTop: "1px solid var(--line)" }}
        >
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

      {moveModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: 360 }}>
            <div className="card-head">
              <h2>Move {selectedIds.size} Student(s)</h2>
              <button
                type="button"
                className="btn secondary"
                onClick={() => setMoveModalOpen(false)}
              >
                Cancel
              </button>
            </div>
            <div className="card-body">
              <label className="field-label">
                Target Section
                <select
                  className="field-control"
                  value={moveTargetSectionId}
                  onChange={(e) => setMoveTargetSectionId(e.target.value)}
                  disabled={moveSectionsLoading}
                >
                  <option value="">
                    {moveSectionsLoading
                      ? "Loading sections…"
                      : "Select a section"}
                  </option>
                  {moveSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <p
                style={{
                  fontSize: 11.5,
                  color: "var(--ink-faint)",
                  marginTop: 6,
                }}
              >
                Note: there's no "Auto" option here — the backend requires an
                explicit target section for bulk moves.
              </p>
              {moveMutation.isError && (
                <p style={{ color: "crimson", fontSize: 12.5, marginTop: 8 }}>
                  {(moveMutation.error as Error)?.message ??
                    "Failed to move students."}
                </p>
              )}
              <button
                type="button"
                className="btn"
                style={{ marginTop: 14, width: "100%" }}
                disabled={!moveTargetSectionId || moveMutation.isPending}
                onClick={handleMoveSubmit}
              >
                {moveMutation.isPending ? "Moving…" : "Move Students"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentsPage;
