import { useEffect, useState } from "react";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
} from "../../hooks/useCourseQueries";
import type { Course } from "../../types/course.types";

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 5,
  border: "1px solid var(--line)",
  fontSize: 13,
  width: "100%",
};

type Props = {
  mode: "create" | "edit" | "view";
  courseId?: string;
  onClose: () => void;
};

export default function CourseForm({ mode, courseId, onClose }: Props) {
  const [formMode, setFormMode] = useState(mode);
  const existing = useCourse(formMode === "create" ? null : (courseId ?? null));
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creditHours, setCreditHours] = useState(3);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (formMode !== "create" && existing.data) {
      setCode(existing.data.code);
      setName(existing.data.name);
      setDescription(existing.data.description ?? "");
      setCreditHours(existing.data.creditHours);
    }
  }, [formMode, existing.data]);

  const pending = createMutation.isPending || updateMutation.isPending;
  const isViewing = formMode === "view";
  const title =
    formMode === "create"
      ? "Create Course"
      : isViewing
        ? "Course Details"
        : "Edit Course";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!code.trim() || !name.trim() || creditHours < 1) {
      setFormError("Code, name, and credit hours (min 1) are required.");
      return;
    }

    try {
      if (formMode === "create") {
        await createMutation.mutateAsync({
          code: code.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          creditHours,
        });
      } else if (courseId) {
        await updateMutation.mutateAsync({
          id: courseId,
          payload: {
            code: code.trim(),
            name: name.trim(),
            description: description.trim() || undefined,
            creditHours,
          },
        });
      } else {
        setFormError("Course details are unavailable.");
        return;
      }
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save the course.",
      );
    }
  };

  const handleClose = () => {
    if (!pending) onClose();
  };

  return (
    <Dialog
      open
      disablePortal
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="course-modal-title"
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
        id="course-modal-title"
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
        {title}
        <IconButton
          aria-label="Close"
          onClick={handleClose}
          disabled={pending}
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
        {formMode !== "create" && existing.isLoading ? (
          <p className="meta">Loading course...</p>
        ) : existing.isError && formMode !== "create" ? (
          <div role="alert" style={{ color: "var(--red)" }}>
            <p>
              {existing.error instanceof Error
                ? existing.error.message
                : "Unable to load course."}
            </p>
            <button
              type="button"
              className="btn secondary"
              onClick={() => existing.refetch()}
            >
              Retry
            </button>
          </div>
        ) : formMode !== "create" && !existing.data ? (
          <p role="alert" style={{ color: "var(--red)" }}>
            Course details are unavailable.
          </p>
        ) : isViewing && existing.data ? (
          <CourseDetails course={existing.data} />
        ) : (
          <form onSubmit={submit}>
            {formError && (
              <p role="alert" style={{ color: "var(--red)", marginTop: 0 }}>
                {formError}
              </p>
            )}
            <div className="profile-fields">
              <div className="profile-field">
                <label className="profile-field__label" htmlFor="course-code">
                  Code
                </label>
                <input
                  id="course-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="LAW-401"
                  required
                  style={inputStyle}
                />
              </div>
              <div className="profile-field">
                <label className="profile-field__label" htmlFor="course-name">
                  Name
                </label>
                <input
                  id="course-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Constitutional Law"
                  required
                  style={inputStyle}
                />
              </div>
              <div className="profile-field">
                <label
                  className="profile-field__label"
                  htmlFor="course-credit-hours"
                >
                  Credit hours
                </label>
                <input
                  id="course-credit-hours"
                  type="number"
                  min={1}
                  value={creditHours}
                  onChange={(event) =>
                    setCreditHours(Number(event.target.value))
                  }
                  required
                  style={inputStyle}
                />
              </div>
              <div className="profile-field">
                <label
                  className="profile-field__label"
                  htmlFor="course-description"
                >
                  Description
                </label>
                <textarea
                  id="course-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  style={inputStyle}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                className="btn secondary"
                onClick={handleClose}
                disabled={pending}
              >
                Cancel
              </button>
              <button type="submit" className="btn" disabled={pending}>
                {pending
                  ? "Saving..."
                  : formMode === "create"
                    ? "Create Course"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        )}
        {isViewing && existing.data && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 20,
            }}
          >
            <button
              type="button"
              className="btn secondary"
              onClick={handleClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setFormError(null);
                setFormMode("edit");
              }}
            >
              Edit Course
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CourseDetails({ course }: { course: Course }) {
  const details = [
    { label: "Code", value: course.code },
    { label: "Name", value: course.name },
    { label: "Credit hours", value: String(course.creditHours) },
    { label: "Usage count", value: course.usageCount ?? "—" },
    { label: "Description", value: course.description || "—" },
  ];

  return (
    <div className="profile-fields">
      {details.map((detail) => (
        <div className="profile-field" key={detail.label}>
          <div className="profile-field__label">{detail.label}</div>
          <div className="profile-field__value">{detail.value}</div>
        </div>
      ))}
    </div>
  );
}
