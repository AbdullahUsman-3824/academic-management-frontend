import { useEffect, useState } from "react";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useBatches, useSections } from "../../hooks/useAcademicQueries";
import { useSectionAllocationHistory } from "../../hooks/useCourseQueries";
import type { SectionAllocationHistoryResponse } from "../../types/course.types";

type Props = {
  onClose: () => void;
};

type HistoryCourse =
  SectionAllocationHistoryResponse["history"][number]["courses"][number];

export default function AllocationHistoryModal({ onClose }: Props) {
  const [batchId, setBatchId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const batchesQuery = useBatches();
  const batches = batchesQuery.data ?? [];
  const sectionsQuery = useSections(batchId || null);
  const sections = sectionsQuery.data ?? [];
  const historyQuery = useSectionAllocationHistory(sectionId || null);

  useEffect(() => {
    if (!batches.some((batch) => batch.id === batchId)) {
      setBatchId(batches[0]?.id ?? "");
      setSectionId("");
    }
  }, [batchId, batches]);

  useEffect(() => {
    if (!sections.some((section) => section.id === sectionId)) {
      setSectionId(sections[0]?.id ?? "");
    }
  }, [sectionId, sections]);

  return (
    <Dialog
      open
      disablePortal
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="allocation-history-modal-title"
      slotProps={{
        paper: {
          sx: {
            border: "1px solid var(--line)",
            borderRadius: 2,
            boxShadow: "0 18px 56px rgba(20, 42, 30, 0.2)",
            backgroundColor: "var(--card)",
            backgroundImage: "none",
            color: "var(--ink)",
            fontFamily: "inherit",
            maxHeight: "92vh",
          },
        },
        backdrop: {
          sx: { backgroundColor: "rgba(18, 33, 26, 0.45)" },
        },
      }}
    >
      <DialogTitle
        id="allocation-history-modal-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 2.5,
          py: 2,
          color: "var(--green-900)",
          fontSize: 18,
          fontWeight: 700,
          borderBottom: "1px solid var(--line)",
        }}
      >
        Allocation History
        <IconButton
          aria-label="Close"
          onClick={onClose}
          size="small"
          sx={{
            color: "var(--ink-soft)",
            "&:hover": {
              color: "var(--green-900)",
              backgroundColor: "var(--green-100)",
            },
          }}
        >
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 2.5,
          borderColor: "var(--line)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <label style={filterLabelStyle}>
            Batch
            <select
              aria-label="Batch"
              value={batchId}
              onChange={(event) => {
                setBatchId(event.target.value);
                setSectionId("");
              }}
              disabled={batchesQuery.isLoading || batches.length === 0}
              style={selectStyle}
            >
              <option value="">
                {batchesQuery.isLoading ? "Loading batches..." : "Select batch"}
              </option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </label>
          <label style={filterLabelStyle}>
            Section
            <select
              aria-label="Section"
              value={sectionId}
              onChange={(event) => setSectionId(event.target.value)}
              disabled={sectionsQuery.isLoading || sections.length === 0}
              style={selectStyle}
            >
              <option value="">
                {!batchId
                  ? "Select a batch first"
                  : sectionsQuery.isLoading
                    ? "Loading sections..."
                    : "Select section"}
              </option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {batchesQuery.isError && (
          <QueryError
            message={getErrorMessage(
              batchesQuery.error,
              "Unable to load batches.",
            )}
            onRetry={() => batchesQuery.refetch()}
          />
        )}
        {sectionsQuery.isError && (
          <QueryError
            message={getErrorMessage(
              sectionsQuery.error,
              "Unable to load sections.",
            )}
            onRetry={() => sectionsQuery.refetch()}
          />
        )}
        {historyQuery.isError && (
          <QueryError
            message={getErrorMessage(
              historyQuery.error,
              "Unable to load allocation history.",
            )}
            onRetry={() => historyQuery.refetch()}
          />
        )}

        {sectionsQuery.isLoading && batchId && (
          <p className="meta">Loading sections...</p>
        )}
        {!sectionsQuery.isLoading &&
          !sectionsQuery.isError &&
          batchId &&
          sections.length === 0 && (
            <p className="meta">No sections are available for this batch.</p>
          )}
        {historyQuery.isLoading && (
          <p className="meta">Loading all semester allocations...</p>
        )}
        {historyQuery.data &&
          historyQuery.data.history.length === 0 &&
          !historyQuery.isLoading && (
            <p className="meta">No allocation history was found.</p>
          )}
        {historyQuery.data?.history.map((semester) => (
          <section key={semester.semester} style={{ marginBottom: 24 }}>
            <h3
              style={{
                margin: "0 0 10px",
                color: "var(--green-900)",
                fontSize: 16,
              }}
            >
              Semester {semester.semester}
            </h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course</th>
                    <th>Credits</th>
                    <th>Type</th>
                    <th>Allocation History</th>
                  </tr>
                </thead>
                <tbody>
                  {semester.courses.map((course) => (
                    <HistoryCourseRow key={course.courseId} course={course} />
                  ))}
                  {semester.courses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="meta">
                        No courses in this semester.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </DialogContent>
    </Dialog>
  );
}

function HistoryCourseRow({ course }: { course: HistoryCourse }) {
  return (
    <tr>
      <td className="subj-title">{course.code}</td>
      <td>{course.name}</td>
      <td>{course.creditHours}</td>
      <td>{course.isCompulsory ? "Compulsory" : "Elective"}</td>
      <td>
        {course.allocations.length === 0 ? (
          <span className="meta">No allocations</span>
        ) : (
          <div style={{ display: "grid", gap: 5 }}>
            {course.allocations.map((allocation) => (
              <div key={allocation.id}>
                <strong>{allocation.session.name}</strong>
                {" - "}
                {allocation.faculty.name} ({allocation.faculty.employeeNumber})
                {" - "}
                {allocation.status}
              </div>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}

function QueryError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" style={{ color: "var(--red)", marginBottom: 14 }}>
      <p>{message}</p>
      <button type="button" className="btn secondary" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

const filterLabelStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  minWidth: 220,
  fontSize: 12,
  fontWeight: 700,
  color: "var(--ink-soft)",
};

const selectStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 5,
  border: "1px solid var(--line)",
  background: "var(--card)",
  color: "var(--ink)",
  font: "inherit",
};
