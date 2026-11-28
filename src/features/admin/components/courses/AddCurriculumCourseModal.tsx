import { useState } from "react";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import type {
  BatchCurriculumSemester,
  Course,
  CreateCoursePayload,
} from "../../types/course.types";
import { useCourses, useCreateCourse } from "../../hooks/useCourseQueries";

type Props = {
  semester: BatchCurriculumSemester;
  existingCourseIds: string[];
  currentCredits: number;
  onAddCourse: (course: Course) => void;
  onClose: () => void;
};

export default function AddCurriculumCourseModal({
  semester,
  existingCourseIds,
  currentCredits,
  onAddCourse,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creditHours, setCreditHours] = useState(3);
  const [createError, setCreateError] = useState<string | null>(null);

  const courseList = useCourses({
    page: 1,
    search: search.trim(),
  });
  const createCourse = useCreateCourse();
  const courses = courseList.data?.data ?? [];

  const handleCreateCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    if (!code.trim() || !name.trim() || creditHours < 1) {
      setCreateError(
        "Course code, name, and a valid credit-hour value are required.",
      );
      return;
    }
    if (currentCredits + creditHours > semester.maxCredits) {
      setCreateError(
        `This course would exceed the semester maximum of ${semester.maxCredits} credit hours.`,
      );
      return;
    }

    const payload: CreateCoursePayload = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      creditHours,
    };
    try {
      const createdCourse = await createCourse.mutateAsync(payload);
      onAddCourse(createdCourse);
      onClose();
    } catch (createRequestError) {
      setCreateError(
        createRequestError instanceof Error
          ? createRequestError.message
          : "Unable to create the course.",
      );
    }
  };

  return (
    <Dialog
      open
      disablePortal
      onClose={() => {
        if (!createCourse.isPending) onClose();
      }}
      fullWidth
      maxWidth="md"
      aria-labelledby="add-course-modal-title"
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
        id="add-course-modal-title"
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
          <div>Add Course — Semester {semester.semesterNumber}</div>
          <div className="meta" style={{ fontWeight: 400, marginTop: 2 }}>
            Add a catalog course to this batch curriculum.
          </div>
        </div>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          disabled={createCourse.isPending}
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
          htmlFor="course-catalog-search"
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--ink-soft)",
            marginBottom: 6,
          }}
        >
          Search Course Catalog
        </label>
        <input
          id="course-catalog-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by course name or code..."
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 5,
            border: "1px solid var(--line)",
            background: "var(--card)",
            color: "var(--ink)",
            font: "inherit",
            fontSize: 13,
          }}
        />
        <p className="meta" style={{ margin: "7px 0 14px" }}>
          Matching courses appear here. Select a course to add it to this
          semester.
        </p>

        {courseList.isLoading ? (
          <div
            className="meta"
            style={{
              padding: "18px 14px",
              textAlign: "center",
              border: "1px solid var(--line)",
              borderRadius: 6,
              background: "var(--paper)",
            }}
          >
            Searching course catalog...
          </div>
        ) : courseList.isError ? (
          <div
            role="alert"
            style={{
              color: "var(--red)",
              padding: 14,
              borderRadius: 6,
              background: "#fdf1ef",
            }}
          >
            <p>
              {courseList.error instanceof Error
                ? courseList.error.message
                : "Unable to load courses."}
            </p>
            <button
              type="button"
              className="btn secondary"
              onClick={() => courseList.refetch()}
            >
              Retry search
            </button>
          </div>
        ) : courses.length > 0 ? (
          <div
            style={{
              maxHeight: 250,
              overflowY: "auto",
              border: "1px solid var(--line)",
              borderRadius: 6,
              background: "var(--paper)",
            }}
          >
            {courses.map((course) => {
              const alreadyAdded = existingCourseIds.includes(course.id);
              const exceedsLimit =
                currentCredits + course.creditHours > semester.maxCredits;
              return (
                <div
                  key={course.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderBottom: "1px solid var(--line)",
                    padding: "11px 14px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="subj-title">
                      <span style={{ color: "var(--green-800)" }}>
                        {course.code}
                      </span>
                      <span style={{ color: "var(--ink-faint)", margin: "0 6px" }}>
                        ·
                      </span>
                      {course.name}
                    </div>
                    <div className="meta" style={{ marginTop: 3 }}>
                      {course.creditHours} credit hours
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn ${alreadyAdded ? "secondary" : ""}`}
                    disabled={alreadyAdded || exceedsLimit}
                    onClick={() => onAddCourse(course)}
                    style={{
                      padding: "6px 12px",
                      opacity: exceedsLimit && !alreadyAdded ? 0.65 : undefined,
                    }}
                  >
                    {alreadyAdded
                      ? "Added"
                      : exceedsLimit
                        ? "Credit limit"
                        : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="meta"
            style={{
              padding: "18px 14px",
              textAlign: "center",
              border: "1px dashed var(--line)",
              borderRadius: 6,
              background: "var(--paper)",
            }}
          >
            {search.trim()
              ? "No matching courses found."
              : "No courses found."}
          </div>
        )}

        <div
          style={{
            borderTop: "1px solid var(--line)",
            marginTop: 20,
            paddingTop: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: showCreateForm ? 14 : 0,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "var(--ink)",
                }}
              >
                Course not found?
              </h3>
              <div className="meta" style={{ marginTop: 2 }}>
                Create a new catalog course and add it to this semester.
              </div>
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setShowCreateForm((shown) => !shown);
                setCreateError(null);
              }}
            >
              {showCreateForm ? "Cancel creation" : "Create New Course"}
            </button>
          </div>

          {showCreateForm && (
            <form
              onSubmit={handleCreateCourse}
              style={{
                padding: 14,
                border: "1px solid var(--line)",
                borderRadius: 6,
                background: "var(--paper)",
              }}
            >
              {createError && (
                <p
                  role="alert"
                  style={{
                    color: "var(--red)",
                    padding: "9px 11px",
                    borderRadius: 5,
                    background: "#fdf1ef",
                  }}
                >
                  {createError}
                </p>
              )}
              <div
                className="profile-fields"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
              >
                <div className="profile-field" style={{ display: "block", padding: 0, border: 0 }}>
                  <label
                    className="profile-field__label"
                    htmlFor="new-course-code"
                  >
                    Course Code
                  </label>
                  <input
                    id="new-course-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                    maxLength={30}
                    style={formInputStyle}
                  />
                </div>
                <div className="profile-field" style={{ display: "block", padding: 0, border: 0 }}>
                  <label
                    className="profile-field__label"
                    htmlFor="new-course-name"
                  >
                    Course Name
                  </label>
                  <input
                    id="new-course-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={150}
                    style={formInputStyle}
                  />
                </div>
                <div className="profile-field" style={{ display: "block", padding: 0, border: 0 }}>
                  <label
                    className="profile-field__label"
                    htmlFor="new-course-credit-hours"
                  >
                    Credit Hours
                  </label>
                  <input
                    id="new-course-credit-hours"
                    type="number"
                    min={1}
                    value={creditHours}
                    onChange={(event) =>
                      setCreditHours(Number(event.target.value))
                    }
                    required
                    style={formInputStyle}
                  />
                </div>
                <div className="profile-field" style={{ display: "block", padding: 0, border: 0 }}>
                  <label
                    className="profile-field__label"
                    htmlFor="new-course-description"
                  >
                    Description
                  </label>
                  <textarea
                    id="new-course-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={2}
                    style={{ ...formInputStyle, resize: "vertical" }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 14,
                }}
              >
                <button
                  type="submit"
                  className="btn"
                  disabled={createCourse.isPending}
                >
                  {createCourse.isPending ? "Creating..." : "Create and Add"}
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const formInputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 5,
  padding: "8px 10px",
  border: "1px solid var(--line)",
  borderRadius: 5,
  background: "var(--card)",
  color: "var(--ink)",
  font: "inherit",
  fontSize: 13,
};
