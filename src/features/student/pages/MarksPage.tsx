import { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import { marks } from "../data/mockStudent";
import FilterDropdown, {
  type FilterOption,
} from "../components/FilterDropdown";

/* ---------- Types ---------- */

export interface Mark {
  subjectCode: string;
  subjectTitle: string;
  title: string;
  category: string;
  score: string;
}

const data: Mark[] = marks;

/* ---------- Page ---------- */

function MarksPage() {
  const [selectedCategories, setSelectedCategories] = useState<FilterOption[]>(
    [],
  );

  const [selectedCourses, setSelectedCourses] = useState<FilterOption[]>([]);

  const categoryOptions = useMemo<FilterOption[]>(
    () =>
      Array.from(new Set(data.map((m) => m.category))).map((category) => ({
        value: category,
        label: category,
      })),
    [],
  );

  const courseOptions = useMemo<FilterOption[]>(
    () =>
      Array.from(
        new Map(data.map((m) => [m.subjectCode, m.subjectTitle])).entries(),
      ).map(([code, title]) => ({
        value: code,
        label: `${code} — ${title}`,
      })),
    [],
  );

  const hasFilters =
    selectedCategories.length > 0 || selectedCourses.length > 0;

  const categorySet = useMemo(
    () => new Set(selectedCategories.map((o) => o.value)),
    [selectedCategories],
  );

  const courseSet = useMemo(
    () => new Set(selectedCourses.map((o) => o.value)),
    [selectedCourses],
  );

  const filtered = useMemo(
    () =>
      data.filter((mark) => {
        const matchesCategory =
          categorySet.size === 0 || categorySet.has(mark.category);

        const matchesCourse =
          courseSet.size === 0 || courseSet.has(mark.subjectCode);

        return matchesCategory && matchesCourse;
      }),
    [categorySet, courseSet],
  );

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedCourses([]);
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
              sx={{
                fontSize: 12,
                textTransform: "none",
                mb: "1px",
              }}
            >
              Clear all filters
            </Button>
          )}
          <div className="w-44 min-w-0">
            <FilterDropdown
              label="Category"
              options={categoryOptions}
              value={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>

          <div className="w-56 min-w-0">
            <FilterDropdown
              label="Course"
              options={courseOptions}
              value={selectedCourses}
              onChange={setSelectedCourses}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Assessment</th>
                <th>Score</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="page-placeholder__todo">
                    {hasFilters
                      ? "No marks match the selected filters."
                      : "No marks recorded yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.subjectCode + entry.title}>
                    <td>
                      <div className="code">{entry.subjectCode}</div>
                      <div className="subj-sub">{entry.subjectTitle}</div>
                    </td>

                    <td className="subj-title">{entry.title}</td>

                    <td>{entry.score}</td>
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
