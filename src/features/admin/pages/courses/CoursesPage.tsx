import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCourses } from "../../hooks/useCourseQueries";
import CatalogTab from "../../components/courses/CatalogTab";
import CourseForm from "../../components/courses/CourseForm";
import CourseManagementOverview from "../../components/courses/CourseManagementOverview";
import BatchCurriculumTab from "../../components/courses/BatchCurriculumTab";
import CourseAllocationTab from "../../components/courses/CourseAllocationTab";
import StudentEnrollmentsTab from "../../components/courses/StudentEnrollmentsTab";

type MainTab =
  | "overview"
  | "catalog"
  | "curriculum"
  | "allocations"
  | "enrollments";

type CourseDialogState = {
  mode: "create" | "edit" | "view";
  courseId?: string;
} | null;

const TABS: ReadonlyArray<readonly [MainTab, string]> = [
  ["overview", "Overview"],
  ["catalog", "Catalog"],
  ["curriculum", "Batch Curriculum"],
  ["allocations", "Course Allocation"],
  ["enrollments", "Student Enrollments"],
];

const isMainTab = (value: string | null): value is MainTab =>
  value !== null && TABS.some(([key]) => key === value);

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const mainTab: MainTab = isMainTab(rawTab) ? rawTab : "overview";

  const setMainTab = (tab: MainTab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === "overview") next.delete("tab");
    else next.set("tab", tab);
    setSearchParams(next);
  };

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const [courseDialog, setCourseDialog] = useState<CourseDialogState>(null);

  const list = useCourses({
    page,
    search: search || undefined,
  });

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Course Management</h1>
          <div className="today">
            Operate the centralized catalog, batch curricula, faculty
            allocations, and student enrollments.
          </div>
        </div>
        {mainTab === "catalog" && (
          <button
            type="button"
            className="btn"
            onClick={() => setCourseDialog({ mode: "create" })}
          >
            + New Course
          </button>
        )}
      </div>

      <div className="card">
        <div
          className="tabs-row"
          role="tablist"
          aria-label="Course management sections"
        >
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mainTab === key}
              className={`tab-btn${mainTab === key ? " active" : ""}`}
              onClick={() => setMainTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {mainTab === "overview" && (
          <CourseManagementOverview onNavigate={setMainTab} />
        )}

        {mainTab === "catalog" && (
          <CatalogTab
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            onSearch={applySearch}
            page={page}
            setPage={setPage}
            data={list.data}
            isLoading={list.isLoading}
            isError={list.isError}
            error={list.error}
            refetch={list.refetch}
            onView={(id) => setCourseDialog({ mode: "view", courseId: id })}
            onEdit={(id) => setCourseDialog({ mode: "edit", courseId: id })}
          />
        )}

        {mainTab === "curriculum" && <BatchCurriculumTab />}
        {mainTab === "allocations" && <CourseAllocationTab />}
        {mainTab === "enrollments" && <StudentEnrollmentsTab />}
      </div>

      {courseDialog && (
        <CourseForm
          key={`${courseDialog.mode}:${courseDialog.courseId ?? "new"}`}
          mode={courseDialog.mode}
          courseId={courseDialog.courseId}
          onClose={() => setCourseDialog(null)}
        />
      )}
    </>
  );
}
