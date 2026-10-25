import { useState } from "react";
import { useCourses } from "../../hooks/useCourseQueries";
import { useBulkCreateSemesterCourses } from "../../hooks/useSemesterCourseQueries";
import type { SemesterCourse } from "../../../../api/semesterCourses";

type Props = {
  semesterId: string;
  existingMappings: SemesterCourse[];
  onClose: () => void;
};

type CourseSelection = {
  courseId: string;
  isCompulsory: boolean;
};

export default function MapCoursesModal({
  semesterId,
  existingMappings,
  onClose,
}: Props) {
  const [selections, setSelections] = useState<CourseSelection[]>([]);
  const { data: coursesData, isLoading } = useCourses({ status: "active" });
  const bulkMutation = useBulkCreateSemesterCourses();

  const courses = coursesData?.data ?? [];
  const existingCourseIds = new Set(existingMappings.map((m) => m.courseId));
  const availableCourses = courses.filter((c) => !existingCourseIds.has(c.id));

  const isSelected = (courseId: string) =>
    selections.some((s) => s.courseId === courseId);

  const toggleSelection = (courseId: string) => {
    if (isSelected(courseId)) {
      setSelections(selections.filter((s) => s.courseId !== courseId));
    } else {
      setSelections([...selections, { courseId, isCompulsory: true }]);
    }
  };

  const updateIsCompulsory = (courseId: string, isCompulsory: boolean) => {
    setSelections(
      selections.map((s) =>
        s.courseId === courseId ? { ...s, isCompulsory } : s,
      ),
    );
  };

  const handleSubmit = async () => {
    if (selections.length === 0) {
      alert("Please select at least one course");
      return;
    }

    const nextOrder = existingMappings.length + 1;
    const payload = {
      semesterId,
      courses: selections.map((s, idx) => ({
        courseId: s.courseId,
        isCompulsory: s.isCompulsory,
        displayOrder: nextOrder + idx,
      })),
    };

    try {
      const result = await bulkMutation.mutateAsync(payload);
      if (result.errors.length > 0) {
        const errorMsg = result.errors
          .map((e) => `Course ${e.courseId}: ${e.error}`)
          .join("\n");
        alert(`Some courses failed:\n${errorMsg}`);
      }
      if (result.success.length > 0) {
        onClose();
      }
    } catch (err) {
      alert(`Failed to map courses: ${(err as Error).message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 700, maxHeight: "80vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            Map Courses to Semester
          </h2>
          <button
            type="button"
            className="btn secondary"
            onClick={onClose}
            style={{ padding: "4px 12px" }}
          >
            ✕
          </button>
        </div>

        {isLoading && (
          <p style={{ color: "var(--ink-faint)" }}>Loading courses...</p>
        )}

        {!isLoading && availableCourses.length === 0 && (
          <p style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>
            All active courses are already mapped to this semester.
          </p>
        )}

        {!isLoading && availableCourses.length > 0 && (
          <>
            <p
              style={{
                fontSize: 13,
                color: "var(--ink-faint)",
                marginBottom: 12,
              }}
            >
              Select courses to map. {selections.length} selected.
            </p>

            <div style={{ maxHeight: 400, overflow: "auto" }}>
              <table style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}></th>
                    <th>Code</th>
                    <th>Name</th>
                    <th style={{ width: 80 }}>Credits</th>
                    <th style={{ width: 120 }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCourses.map((course) => {
                    const selected = isSelected(course.id);
                    const selection = selections.find(
                      (s) => s.courseId === course.id,
                    );
                    return (
                      <tr
                        key={course.id}
                        style={{
                          backgroundColor: selected
                            ? "var(--focus-ring-light)"
                            : undefined,
                        }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelection(course.id)}
                          />
                        </td>
                        <td>
                          <div className="subj-title">{course.code}</div>
                        </td>
                        <td>
                          <div className="subj-title">{course.name}</div>
                        </td>
                        <td className="subj-sub">{course.creditHours}</td>
                        <td>
                          {selected && (
                            <select
                              value={selection?.isCompulsory ? "true" : "false"}
                              onChange={(e) =>
                                updateIsCompulsory(
                                  course.id,
                                  e.target.value === "true",
                                )
                              }
                              style={{
                                padding: "4px 8px",
                                fontSize: 12,
                                border: "1px solid var(--line)",
                                borderRadius: 4,
                              }}
                            >
                              <option value="true">Compulsory</option>
                              <option value="false">Elective</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid var(--line)",
              }}
            >
              <button
                type="button"
                className="btn secondary"
                onClick={onClose}
                disabled={bulkMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleSubmit}
                disabled={bulkMutation.isPending || selections.length === 0}
              >
                {bulkMutation.isPending ? "Mapping..." : "Map Courses"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
