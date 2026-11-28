import { useEffect, useMemo, useState } from "react";
import AllocationFacultyModal from "./AllocationFacultyModal";
import AllocationHistoryModal from "./AllocationHistoryModal";
import {
  useCurrentSectionAllocations,
  useCurrentSessionGroups,
} from "../../hooks/useCourseQueries";

export default function CourseAllocationTab() {
  const [sectionId, setSectionId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const groupsQuery = useCurrentSessionGroups();

  // Flat list: every option carries the full "batch · semester · section"
  // identity, so the collapsed select never reads as just a section.
  const sectionOptions = useMemo(
    () =>
      (groupsQuery.data?.groups ?? []).flatMap((group) =>
        group.sections.map((section) => ({
          id: section.id,
          canAllocate: group.canAllocate,
          label: `${group.batchName} - ${group.semester ?? "No current semester"} - ${section.name}`,
        })),
      ),
    [groupsQuery.data],
  );

  const selectedSection = sectionOptions.find(
    (section) => section.id === sectionId,
  );
  const allocationsQuery = useCurrentSectionAllocations(
    selectedSection?.canAllocate ? sectionId : null,
  );
  const currentAllocations = allocationsQuery.data;
  const courses = currentAllocations?.courses ?? [];
  const selectedCourse = courses.find(
    (course) => course.courseId === selectedCourseId,
  );
  const allocatedCount = courses.filter(
    (course) => course.allocation !== null,
  ).length;

  useEffect(() => {
    if (!sectionOptions.some((section) => section.id === sectionId)) {
      setSectionId(
        (sectionOptions.find((section) => section.canAllocate) ??
          sectionOptions[0])
          ?.id ?? "",
      );
    }
  }, [sectionId, sectionOptions]);

  const isSelectDisabled = groupsQuery.isLoading || sectionOptions.length === 0;
  const selectPlaceholder = groupsQuery.isLoading
    ? "Loading batch/semester/section…"
    : groupsQuery.isError
      ? "Unable to load batch/semester/section"
      : sectionOptions.length === 0
        ? "None available in current session"
        : "Select batch · semester · section";

  return (
    <>
      <div className="card-head card-head--toolbar">
        <label className="field-label">
          <select
            className="select"
            value={sectionId}
            onChange={(event) => setSectionId(event.target.value)}
            disabled={isSelectDisabled}
            aria-busy={groupsQuery.isLoading}
          >
            <option value="" disabled>
              {selectPlaceholder}
            </option>
            {sectionOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {groupsQuery.data && (
          <div className="card-head-meta">
            <span className="tag">
              Session: {groupsQuery.data.session.name}
            </span>
          </div>
        )}
        <button
          type="button"
          className="btn secondary"
          onClick={() => setShowHistory(true)}
        >
          View Allocations History
        </button>
      </div>

      {groupsQuery.isError && (
        <div className="card-body" role="alert">
          <p style={{ color: "var(--red)" }}>
            {groupsQuery.error instanceof Error
              ? groupsQuery.error.message
              : "Unable to load current-session groups."}
          </p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => groupsQuery.refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {!groupsQuery.isLoading &&
        !groupsQuery.isError &&
        sectionOptions.length === 0 && (
          <div className="card-body meta">
            No sections are available in the current session.
          </div>
        )}

      {selectedSection && !selectedSection.canAllocate && (
        <div className="card-body meta">
          This batch has no current semester available for allocations.
        </div>
      )}

      {allocationsQuery.isLoading && (
        <div className="card-body meta">Loading section allocations...</div>
      )}

      {allocationsQuery.isError && (
        <div className="card-body" role="alert">
          <p style={{ color: "var(--red)" }}>
            {allocationsQuery.error instanceof Error
              ? allocationsQuery.error.message
              : "Unable to load section allocations."}
          </p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => allocationsQuery.refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {currentAllocations && (
        <>
          <div
            className="card-head"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            <span className="meta">
              {courses.length} total · {allocatedCount} allocated ·{" "}
              {Math.max(courses.length - allocatedCount, 0)} pending
            </span>
            <span className="meta">
              {currentAllocations.group.batch} · Semester{" "}
              {currentAllocations.group.semester} ·{" "}
              {currentAllocations.group.section}
            </span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Credit Hours</th>
                  <th>Faculty</th>
                  <th>Allocation Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.courseId}>
                    <td className="subj-title">{course.name}</td>
                    <td>{course.code}</td>
                    <td>{course.creditHours}</td>
                    <td>{course.allocation?.facultyName ?? "—"}</td>
                    <td>{course.allocation?.status ?? "Unallocated"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => setSelectedCourseId(course.courseId)}
                      >
                        {course.allocation ? "Change" : "Allocate"}
                      </button>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        color: "var(--ink-faint)",
                        padding: 32,
                      }}
                    >
                      No curriculum courses are available for this section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      {selectedCourse && currentAllocations && (
        <AllocationFacultyModal
          key={`${sectionId}:${selectedCourse.courseId}`}
          course={selectedCourse}
          sectionId={sectionId}
          group={currentAllocations.group}
          onClose={() => setSelectedCourseId(null)}
        />
      )}
      {showHistory && (
        <AllocationHistoryModal onClose={() => setShowHistory(false)} />
      )}
    </>
  );
}
