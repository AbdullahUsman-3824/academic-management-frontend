import { useEffect, useMemo, useState } from "react";
import ConfirmationDialog from "../ConfirmationDialog";
import AddCurriculumCourseModal from "./AddCurriculumCourseModal";
import CopyCurriculumModal from "./CopyCurriculumModal";
import type {
  BatchCurriculumCourse,
  BatchCurriculumSemester,
  Course,
} from "../../types/course.types";
import { useBatches } from "../../hooks/useAcademicQueries";
import {
  useBatchCurriculum,
  useSaveBatchCurriculum,
} from "../../hooks/useCourseQueries";

type CurriculumCourseDraft = Omit<BatchCurriculumCourse, "assignmentId"> & {
  assignmentId?: string;
};

type CurriculumSemesterDraft = {
  addedCourses: CurriculumCourseDraft[];
  removedCourseIds: string[];
};

type PendingConfirmation =
  | { type: "remove-course"; courseId: string }
  | { type: "discard-draft" };

export default function BatchCurriculumTab() {
  const [batchId, setBatchId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);
  const [courseDrafts, setCourseDrafts] = useState<
    Record<string, CurriculumSemesterDraft>
  >({});

  const { data: batches, isLoading: loadingBatches } = useBatches();
  const saveCurriculum = useSaveBatchCurriculum();
  const {
    data: curriculum,
    isLoading: loadingCurriculum,
    isError: curriculumError,
    error,
    refetch,
  } = useBatchCurriculum(batchId || null);

  useEffect(() => {
    if (!batchId && batches?.length) {
      setBatchId(batches[0].id);
    }
  }, [batchId, batches]);

  const semester = curriculum?.semesters.find(
    (item) => item.semesterNumber === selectedSemester,
  );
  const semesterCourses = semester
    ? getSemesterCourses(semester, courseDrafts[semester.semesterId])
    : [];
  const totalCredits = useMemo(
    () => semesterCourses.reduce((total, course) => total + course.creditHours, 0),
    [semesterCourses],
  );
  const changedSemesters = useMemo(
    () =>
      (curriculum?.semesters ?? []).filter(
        (item) =>
          !item.isLocked &&
          hasSemesterDraftChanges(courseDrafts[item.semesterId]),
      ),
    [courseDrafts, curriculum],
  );
  const hasInvalidDraft = changedSemesters.some((item) => {
    const credits = getSemesterCourses(
      item,
      courseDrafts[item.semesterId],
    ).reduce((total, course) => total + course.creditHours, 0);
    return credits < item.minCredits || credits > item.maxCredits;
  });

  const addCourseToSemester = (course: Course) => {
    if (!semester || semester.isLocked) return;
    const currentDraft = courseDrafts[semester.semesterId] ?? emptySemesterDraft();
    const isInOriginal = semester.courses.some(
      (item) => item.courseId === course.id,
    );
    const isRemoved = currentDraft.removedCourseIds.includes(course.id);
    const isAdded = currentDraft.addedCourses.some(
      (item) => item.courseId === course.id,
    );
    if ((isInOriginal && !isRemoved) || isAdded) return;
    if (totalCredits + course.creditHours > semester.maxCredits) return;

    setSaveMessage(null);
    setCourseDrafts((current) => {
      const draft = current[semester.semesterId] ?? emptySemesterDraft();
      if (isInOriginal) {
        return {
          ...current,
          [semester.semesterId]: {
            ...draft,
            removedCourseIds: draft.removedCourseIds.filter(
              (id) => id !== course.id,
            ),
          },
        };
      }

      const currentCourses = getSemesterCourses(semester, draft);
      return {
        ...current,
        [semester.semesterId]: {
          ...draft,
          addedCourses: [
            ...draft.addedCourses,
            {
              courseId: course.id,
              code: course.code,
              name: course.name,
              description: course.description ?? null,
              creditHours: course.creditHours,
              displayOrder: currentCourses.length + 1,
            },
          ],
        },
      };
    });
  };

  const requestRemoveCourse = (courseId: string) => {
    if (!semester || semester.isLocked) return;
    setPendingConfirmation({ type: "remove-course", courseId });
  };

  const removeCourse = (courseId: string) => {
    if (!semester || semester.isLocked) return;
    setSaveMessage(null);
    setCourseDrafts((current) => {
      const draft = current[semester.semesterId] ?? emptySemesterDraft();
      const isAdded = draft.addedCourses.some(
        (course) => course.courseId === courseId,
      );
      return {
        ...current,
        [semester.semesterId]: isAdded
          ? {
              ...draft,
              addedCourses: draft.addedCourses.filter(
                (course) => course.courseId !== courseId,
              ),
            }
          : {
              ...draft,
              removedCourseIds: draft.removedCourseIds.includes(courseId)
                ? draft.removedCourseIds
                : [...draft.removedCourseIds, courseId],
            },
      };
    });
  };

  const addCopiedCourses = (sourceSemesters: BatchCurriculumSemester[]) => {
    if (!curriculum) return ["The target curriculum is not loaded."];

    const notices: string[] = [];
    const skippedLocked: number[] = [];
    const draftChanges: Record<string, CurriculumSemesterDraft> = {};
    let addedCourseCount = 0;

    sourceSemesters.forEach((sourceSemester) => {
      const targetSemester = curriculum.semesters.find(
        (item) => item.semesterNumber === sourceSemester.semesterNumber,
      );
      if (!targetSemester) {
        notices.push(
          `Semester ${sourceSemester.semesterNumber} does not exist in the target batch.`,
        );
        return;
      }
      if (targetSemester.isLocked) {
        skippedLocked.push(targetSemester.semesterNumber);
        return;
      }

      const currentDraft =
        courseDrafts[targetSemester.semesterId] ?? emptySemesterDraft();
      const draft = {
        addedCourses: [...currentDraft.addedCourses],
        removedCourseIds: [...currentDraft.removedCourseIds],
      };
      const visibleCourseIds = new Set(
        getSemesterCourses(targetSemester, draft).map(
          (course) => course.courseId,
        ),
      );
      sourceSemester.courses.forEach((course) => {
        if (visibleCourseIds.has(course.courseId)) return;
        const existingCourse = targetSemester.courses.some(
          (targetCourse) => targetCourse.courseId === course.courseId,
        );
        if (existingCourse) {
          draft.removedCourseIds = draft.removedCourseIds.filter(
            (id) => id !== course.courseId,
          );
        } else {
          draft.addedCourses.push({
            courseId: course.courseId,
            code: course.code,
            name: course.name,
            description: course.description,
            creditHours: course.creditHours,
            displayOrder:
              targetSemester.courses.length + draft.addedCourses.length + 1,
          });
        }
        visibleCourseIds.add(course.courseId);
        addedCourseCount += 1;
      });
      draftChanges[targetSemester.semesterId] = draft;
    });

    if (skippedLocked.length > 0) {
      notices.push(
        `Locked semester${skippedLocked.length > 1 ? "s" : ""} ${skippedLocked.join(", ")} left unchanged.`,
      );
    }
    if (addedCourseCount === 0 && notices.length === 0) {
      notices.push(
        "No new courses were added; all selected courses are already in the draft.",
      );
    }

    if (Object.keys(draftChanges).length > 0) {
      setSaveMessage(null);
      setCourseDrafts((current) => ({ ...current, ...draftChanges }));
    }
    return notices;
  };

  const saveDraft = async () => {
    if (!batchId || changedSemesters.length === 0 || hasInvalidDraft) return;
    setSaveMessage(null);
    try {
      await saveCurriculum.mutateAsync({
        batchId,
        payload: {
          semesters: changedSemesters.map((item) => ({
            semesterId: item.semesterId,
            courses: getSemesterCourses(item, courseDrafts[item.semesterId]).map(
              (course, index) => ({
                courseId: course.courseId,
                displayOrder: index + 1,
              }),
            ),
          })),
        },
      });
      setCourseDrafts({});
      setSaveMessage("Curriculum saved.");
    } catch (saveError) {
      setSaveMessage(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save the curriculum.",
      );
    }
  };

  const requestDiscardDraft = () => {
    if (!curriculum || changedSemesters.length === 0) return;
    setPendingConfirmation({ type: "discard-draft" });
  };

  const discardDraft = () => {
    setCourseDrafts({});
    setSaveMessage(null);
  };

  const confirmPendingAction = () => {
    const confirmation = pendingConfirmation;
    if (!confirmation) return;
    setPendingConfirmation(null);
    if (confirmation.type === "remove-course") {
      removeCourse(confirmation.courseId);
    } else {
      discardDraft();
    }
  };

  return (
    <>
      <div
        className="card-head"
        style={{
          borderBottom: "1px solid var(--line)",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label>
            <strong>Batch</strong>
          </label>
          <select
            value={batchId}
            onChange={(event) => {
              setBatchId(event.target.value);
              setSelectedSemester(1);
              setCourseDrafts({});
              setSaveMessage(null);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 5,
              border: "1px solid var(--line)",
            }}
          >
            {loadingBatches && <option value="">Loading batches...</option>}
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
          {semester && (
            <span
              className={`status ${semester.isLocked ? "inactive" : "upcoming"}`}
            >
              {semester.isLocked ? "Locked" : "Upcoming"}
            </span>
          )}
        </div>
      </div>

      <div
        className="tabs-row"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        {(curriculum?.semesters ?? []).map((item) => (
          <button
            key={item.semesterNumber}
            type="button"
            className={`tab-btn${selectedSemester === item.semesterNumber ? " active" : ""}`}
            onClick={() => setSelectedSemester(item.semesterNumber)}
          >
            Semester {item.semesterNumber}
          </button>
        ))}
      </div>

      {loadingCurriculum ? (
        <div className="card-body" style={{ color: "var(--ink-faint)" }}>
          Loading batch curriculum...
        </div>
      ) : curriculumError ? (
        <div className="card-body">
          <p style={{ color: "var(--red)", margin: "0 0 12px" }}>
            {error instanceof Error
              ? error.message
              : "Failed to load batch curriculum"}
          </p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      ) : !curriculum ? (
        <div className="card-body" style={{ color: "var(--ink-faint)" }}>
          No curriculum has been created for this batch.
        </div>
      ) : semester ? (
        <>
          <div
            className="card-head"
            style={{
              borderBottom: "1px solid var(--line)",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span className="meta">
              {semesterCourses.length} courses · {totalCredits} /{" "}
              {semester.maxCredits} credit hours
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {!semester.isLocked && (
                <>
                  <button
                    type="button"
                    className="btn secondary"
                    disabled={loadingBatches || !batches}
                    onClick={() => setShowCopyModal(true)}
                  >
                    Copy From
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowCoursePicker(true)}
                  >
                    + Add Course
                  </button>
                </>
              )}
              {changedSemesters.length > 0 && (
                <>
                  <button
                    type="button"
                    className="btn secondary"
                    disabled={saveCurriculum.isPending}
                    onClick={requestDiscardDraft}
                  >
                    Discard All Changes
                  </button>
                  <button
                    type="button"
                    className="btn"
                    disabled={saveCurriculum.isPending || hasInvalidDraft}
                    onClick={saveDraft}
                  >
                    {saveCurriculum.isPending ? "Saving..." : "Save Curriculum"}
                  </button>
                </>
              )}
            </div>
          </div>
          {saveMessage && (
            <div
              className="card-body"
              role={saveMessage === "Curriculum saved." ? "status" : "alert"}
              style={{
                color:
                  saveMessage === "Curriculum saved."
                    ? "var(--green-800)"
                    : "var(--red)",
              }}
            >
              {saveMessage}
            </div>
          )}
          {hasInvalidDraft && (
            <div className="card-body" role="alert" style={{ color: "var(--red)" }}>
              One or more changed semesters are outside their credit limits.
              Adjust the draft before saving.
            </div>
          )}
          {semester.isLocked && (
            <div className="card-body" style={{ color: "var(--ink-faint)" }}>
              This semester has started and its curriculum is locked.
            </div>
          )}
          {totalCredits > semester.maxCredits && (
            <div className="card-body" style={{ color: "var(--red)" }}>
              Credit-hour limit exceeded: maximum {semester.maxCredits} credits.
            </div>
          )}
          {totalCredits < semester.minCredits && (
            <div className="card-body" style={{ color: "var(--red)" }}>
              Credit-hour minimum not met: at least {semester.minCredits} credits are required.
            </div>
          )}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Credit Hours</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {semesterCourses.map((course) => (
                  <tr key={course.courseId}>
                    <td className="subj-title">{course.code}</td>
                    <td>{course.name}</td>
                    <td>{course.creditHours}</td>
                    <td>
                      {!semester.isLocked && (
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          onClick={() => requestRemoveCourse(course.courseId)}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {semesterCourses.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", color: "var(--ink-faint)" }}
                    >
                      No courses have been added.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {showCoursePicker && semester && (
        <AddCurriculumCourseModal
          semester={semester}
          existingCourseIds={semesterCourses.map((course) => course.courseId)}
          currentCredits={totalCredits}
          onAddCourse={addCourseToSemester}
          onClose={() => setShowCoursePicker(false)}
        />
      )}
      {showCopyModal && curriculum && batches && (
        <CopyCurriculumModal
          targetBatchId={batchId}
          batches={batches}
          onApply={addCopiedCourses}
          onClose={() => setShowCopyModal(false)}
        />
      )}
      <ConfirmationDialog
        open={pendingConfirmation !== null}
        title={
          pendingConfirmation?.type === "discard-draft"
            ? "Discard all changes?"
            : "Remove course?"
        }
        message={
          pendingConfirmation?.type === "discard-draft"
            ? "This will discard all unsaved curriculum changes for this batch."
            : "Remove this course from the curriculum draft? Existing enrollments will not be changed."
        }
        confirmLabel={
          pendingConfirmation?.type === "discard-draft"
            ? "Discard Changes"
            : "Remove Course"
        }
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingConfirmation(null)}
      />
    </>
  );
}

function emptySemesterDraft(): CurriculumSemesterDraft {
  return { addedCourses: [], removedCourseIds: [] };
}

function hasSemesterDraftChanges(draft?: CurriculumSemesterDraft): boolean {
  return (
    !!draft &&
    (draft.addedCourses.length > 0 || draft.removedCourseIds.length > 0)
  );
}

function getSemesterCourses(
  semester: BatchCurriculumSemester,
  draft?: CurriculumSemesterDraft,
): CurriculumCourseDraft[] {
  const removedCourseIds = new Set(draft?.removedCourseIds ?? []);
  return [
    ...semester.courses.filter(
      (course) => !removedCourseIds.has(course.courseId),
    ),
    ...(draft?.addedCourses ?? []),
  ].map((course, index) => ({ ...course, displayOrder: index + 1 }));
}
