import { useState } from "react";
import {
  useSemesters,
  useSemesterCoursesBySemesterId,
  useDeleteSemesterCourse,
} from "../../hooks/useSemesterCourseQueries";
import MapCoursesModal from "./MapCoursesModal";

export default function SemesterCoursesTab() {
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [showMapModal, setShowMapModal] = useState(false);

  const { data: semesters, isLoading: loadingSemesters } = useSemesters();
  const {
    data: mappedCourses,
    isLoading: loadingCourses,
    refetch,
  } = useSemesterCoursesBySemesterId(selectedSemesterId || null);
  const deleteMutation = useDeleteSemesterCourse();

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this course from the semester?")) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <>
      <div
        className="card-head"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Semester:</label>
          <select
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 5,
              border: "1px solid var(--line)",
              fontSize: 13,
              minWidth: 200,
            }}
          >
            <option value="">Select Semester</option>
            {semesters?.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.displayName} ({sem.minCredits}-{sem.maxCredits} credits)
              </option>
            ))}
          </select>

          {selectedSemesterId && (
            <button
              type="button"
              className="btn"
              onClick={() => setShowMapModal(true)}
              style={{ marginLeft: "auto" }}
            >
              + Map Courses
            </button>
          )}
        </div>
      </div>

      {loadingSemesters && (
        <div className="card-body">
          <p style={{ color: "var(--ink-faint)", margin: 0 }}>
            Loading semesters...
          </p>
        </div>
      )}

      {!loadingSemesters && !selectedSemesterId && (
        <div className="card-body">
          <p style={{ color: "var(--ink-faint)", margin: 0 }}>
            Select a semester to view and manage course mappings.
          </p>
        </div>
      )}

      {selectedSemesterId && (
        <>
          <div
            className="card-head"
            style={{ borderTop: "none", borderBottom: "1px solid var(--line)" }}
          >
            <span className="meta">
              {loadingCourses
                ? "Loading..."
                : `${mappedCourses?.length ?? 0} course${(mappedCourses?.length ?? 0) !== 1 ? "s" : ""} mapped`}
            </span>
            <button
              type="button"
              className="btn secondary"
              onClick={() => refetch()}
            >
              Refresh
            </button>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th className="col-hide-sm">Credits</th>
                  <th>Type</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loadingCourses && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", color: "var(--ink-faint)" }}
                    >
                      Loading courses...
                    </td>
                  </tr>
                )}
                {!loadingCourses &&
                  (!mappedCourses || mappedCourses.length === 0) && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          color: "var(--ink-faint)",
                          fontStyle: "italic",
                        }}
                      >
                        No courses mapped to this semester yet
                      </td>
                    </tr>
                  )}
                {!loadingCourses &&
                  mappedCourses
                    ?.slice()
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((sc) => (
                      <tr key={sc.id}>
                        <td>
                          <span className="subj-sub">{sc.displayOrder}</span>
                        </td>
                        <td>
                          <div className="subj-title">{sc.course?.code}</div>
                        </td>
                        <td>
                          <div className="subj-title">{sc.course?.name}</div>
                        </td>
                        <td className="subj-sub col-hide-sm">
                          {sc.course?.creditHours}
                        </td>
                        <td>
                          <span
                            className={`status ${sc.isCompulsory ? "active" : "inactive"}`}
                          >
                            {sc.isCompulsory ? "Compulsory" : "Elective"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn secondary"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(sc.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showMapModal && selectedSemesterId && (
        <MapCoursesModal
          semesterId={selectedSemesterId}
          existingMappings={mappedCourses ?? []}
          onClose={() => setShowMapModal(false)}
        />
      )}
    </>
  );
}
