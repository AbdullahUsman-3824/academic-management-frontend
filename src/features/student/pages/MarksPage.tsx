import { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import FilterDropdown, {
  type FilterOption,
} from "../components/FilterDropdown";
import {
  useStudentCourseOptions,
  useStudentMarks,
} from "../hooks/useStudentQueries";
import { getErrorMessage } from "../utils";

function MarksPage() {
  // Both dropdowns are single-select. The course is filtered by the server
  // (?courseId=). The category is matched client-side against each mark's
  // `assessment` label, so the dropdown options always agree with the rows
  // (the backend's category name may differ from the assessment label).
  const [selectedCategory, setSelectedCategory] = useState<FilterOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<FilterOption[]>([]);

  const category = selectedCategory[0]?.value;
  const courseId = selectedCourse[0]?.value;
  const hasFilters = Boolean(category || courseId);

  // GET /students/me/course-options -> Course dropdown
  const courseOptionsQuery = useStudentCourseOptions();

  // GET /students/me/marks?courseId=
  const marksQuery = useStudentMarks({ courseId });

  const courseOptions = useMemo<FilterOption[]>(
    () =>
      (courseOptionsQuery.data ?? []).map((c) => ({
        value: c.id,
        label: `${c.code} — ${c.name}`,
      })),
    [courseOptionsQuery.data],
  );

  const categoryOptions = useMemo<FilterOption[]>(
    () =>
      Array.from(new Set((marksQuery.data ?? []).map((m) => m.assessment)))
        .sort()
        .map((name) => ({ value: name, label: name })),
    [marksQuery.data],
  );

  const rows = (marksQuery.data ?? []).filter(
    (m) => !category || m.assessment === category,
  );

  function clearFilters() {
    setSelectedCategory([]);
    setSelectedCourse([]);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Marks</h1>
          <div className="today">
            Marks obtained across all enrolled subjects, by assessment type.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col items-center gap-3 border-b border-[var(--line)] px-[18px] py-[14px] md:flex-row md:items-end md:justify-end">
          {hasFilters && (
            <Button
              variant="text"
              size="small"
              onClick={clearFilters}
              sx={{ fontSize: 12, textTransform: "none", mb: "1px" }}
            >
              Clear all filters
            </Button>
          )}
          <div className="w-44 min-w-0">
            <FilterDropdown
              label="Category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              multiple={false}
            />
          </div>

          <div className="w-56 min-w-0">
            <FilterDropdown
              label="Course"
              options={courseOptions}
              value={selectedCourse}
              onChange={setSelectedCourse}
              multiple={false}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Assessment</th>
                <th>Marks</th>
              </tr>
            </thead>

            <tbody>
              {marksQuery.isLoading ? (
                <tr>
                  <td colSpan={3} className="page-placeholder__todo">
                    Loading marks…
                  </td>
                </tr>
              ) : marksQuery.isError ? (
                <tr>
                  <td colSpan={3} className="page-placeholder__todo">
                    {getErrorMessage(marksQuery.error, "Failed to load marks.")}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="page-placeholder__todo">
                    {hasFilters
                      ? "No marks match the selected filters."
                      : "No marks recorded yet."}
                  </td>
                </tr>
              ) : (
                rows.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div className="code">{entry.course.code}</div>
                      <div className="subj-sub">{entry.course.name}</div>
                    </td>
                    <td className="subj-title">{entry.assessment}</td>
                    <td>
                      {entry.marks.obtained} / {entry.marks.total}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default MarksPage;