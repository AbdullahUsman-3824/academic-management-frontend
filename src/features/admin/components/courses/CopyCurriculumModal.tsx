import { useEffect, useState } from "react";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import type { BatchCurriculumSemester } from "../../types/course.types";
import {
  useBatchCurriculum,
  useBatchCurriculumCopyPreview,
} from "../../hooks/useCourseQueries";

type Props = {
  targetBatchId: string;
  batches: { id: string; name: string }[];
  onApply: (semesters: BatchCurriculumSemester[]) => string[];
  onClose: () => void;
};

export default function CopyCurriculumModal({
  targetBatchId,
  batches,
  onApply,
  onClose,
}: Props) {
  const [sourceBatchId, setSourceBatchId] = useState("");
  const [copyMode, setCopyMode] = useState<"all" | "semester">("all");
  const [sourceSemesterId, setSourceSemesterId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const sourceBatches = batches.filter((batch) => batch.id !== targetBatchId);
  const sourceCurriculum = useBatchCurriculum(sourceBatchId || null);
  const preview = useBatchCurriculumCopyPreview(
    targetBatchId,
    sourceBatchId || null,
    copyMode === "semester" ? sourceSemesterId || null : null,
  );
  const sourceCurriculumData =
    sourceCurriculum.data?.batch.id === sourceBatchId
      ? sourceCurriculum.data
      : undefined;
  const sourceSemesters = sourceCurriculumData?.semesters ?? EMPTY_SEMESTERS;
  const previewCourseCount =
    preview.data?.semesters.reduce(
      (total, semester) => total + semester.courses.length,
      0,
    ) ?? 0;

  useEffect(() => {
    if (!sourceBatchId && sourceBatches.length > 0) {
      setSourceBatchId(sourceBatches[0].id);
    }
  }, [sourceBatchId, sourceBatches]);

  useEffect(() => {
    if (
      !sourceSemesters.some(
        (semester) => semester.semesterId === sourceSemesterId,
      )
    ) {
      setSourceSemesterId(sourceSemesters[0]?.semesterId ?? "");
    }
  }, [sourceSemesterId, sourceSemesters]);

  const handleApply = () => {
    if (!preview.data) return;
    const messages = onApply(preview.data.semesters);
    setFeedback(
      messages.length > 0 ? messages.join(" ") : "Courses added to the draft.",
    );
  };

  return (
    <Dialog
      open
      disablePortal
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="copy-curriculum-modal-title"
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
          },
        },
        backdrop: {
          sx: { backgroundColor: "rgba(18, 33, 26, 0.45)" },
        },
      }}
    >
      <DialogTitle
        id="copy-curriculum-modal-title"
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
        <div>
          <div>Copy Curriculum</div>
          <div className="meta" style={{ fontWeight: 400, marginTop: 2 }}>
            Add courses from another batch to this draft.
          </div>
        </div>
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
      <DialogContent dividers sx={{ p: 2.5, borderColor: "var(--line)" }}>
        <label
          htmlFor="copy-source-batch"
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--ink-soft)",
            marginBottom: 6,
          }}
        >
          Copy from batch
        </label>
        <select
          id="copy-source-batch"
          value={sourceBatchId}
          onChange={(event) => {
            setSourceBatchId(event.target.value);
            setSourceSemesterId("");
            setFeedback(null);
          }}
          disabled={sourceBatches.length === 0}
          style={selectStyle}
        >
          {sourceBatches.length === 0 ? (
            <option value="">No other batches available</option>
          ) : (
            sourceBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))
          )}
        </select>

        <fieldset
          style={{
            border: "1px solid var(--line)",
            borderRadius: 6,
            margin: "18px 0 0",
            padding: "12px 14px",
          }}
        >
          <legend style={{ padding: "0 5px", fontWeight: 700 }}>
            What to copy
          </legend>
          <label style={optionStyle}>
            <input
              type="radio"
              name="copy-curriculum-mode"
              value="all"
              checked={copyMode === "all"}
              onChange={() => {
                setCopyMode("all");
                setFeedback(null);
              }}
            />
            Complete curriculum
          </label>
          <label style={optionStyle}>
            <input
              type="radio"
              name="copy-curriculum-mode"
              value="semester"
              checked={copyMode === "semester"}
              onChange={() => {
                setCopyMode("semester");
                setFeedback(null);
              }}
            />
            Select semester
          </label>
          {copyMode === "semester" && (
            <select
              aria-label="Source semester"
              value={sourceSemesterId}
              onChange={(event) => {
                setSourceSemesterId(event.target.value);
                setFeedback(null);
              }}
              disabled={
                sourceCurriculum.isLoading || sourceSemesters.length === 0
              }
              style={{ ...selectStyle, marginTop: 10 }}
            >
              {sourceSemesters.length === 0 ? (
                <option value="">No semesters available</option>
              ) : (
                sourceSemesters.map((semester) => (
                  <option key={semester.semesterId} value={semester.semesterId}>
                    Semester {semester.semesterNumber}
                  </option>
                ))
              )}
            </select>
          )}
        </fieldset>

        {sourceCurriculum.isError && (
          <p role="alert" style={errorStyle}>
            {sourceCurriculum.error instanceof Error
              ? sourceCurriculum.error.message
              : "Unable to load source batch semesters."}
          </p>
        )}
        {preview.isError && (
          <p role="alert" style={errorStyle}>
            {preview.error instanceof Error
              ? preview.error.message
              : "Unable to preview the source curriculum."}
          </p>
        )}
        {preview.isFetching && !preview.data && (
          <p className="meta" style={{ margin: "14px 0 0" }}>
            Loading curriculum preview...
          </p>
        )}
        {preview.data && !preview.isFetching && previewCourseCount > 0 && (
          <p className="meta" style={{ margin: "14px 0 0" }}>
            {previewCourseCount} courses found in {preview.data.sourceBatch.name}.
          </p>
        )}
        {preview.data && !preview.isFetching && previewCourseCount === 0 && (
          <p className="meta" style={{ margin: "14px 0 0" }}>
            No courses are available to copy.
          </p>
        )}
        {feedback && (
          <p role="status" style={{ ...errorStyle, color: "var(--green-800)" }}>
            {feedback}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 20,
          }}
        >
          <button type="button" className="btn secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleApply}
            disabled={
              !preview.data ||
              previewCourseCount === 0 ||
              preview.isFetching ||
              sourceBatches.length === 0 ||
              (copyMode === "semester" && !sourceSemesterId)
            }
          >
            Add to Draft
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 5,
  border: "1px solid var(--line)",
  background: "var(--card)",
  color: "var(--ink)",
  font: "inherit",
};

const optionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 8,
};

const errorStyle: React.CSSProperties = {
  color: "var(--red)",
  margin: "12px 0 0",
};

const EMPTY_SEMESTERS: BatchCurriculumSemester[] = [];
