import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useCreateAllocation,
  useBulkCreateAllocations,
} from "../../hooks/useAllocationQueries";
import {
  useBatches,
  useEnrollmentSections,
} from "../../hooks/useAcademicQueries";
import { useFaculty } from "../../hooks/useFacultyQueries";
import apiClient from "../../../../api/client";

type Props = {
  onClose: () => void;
};

type FormMode = "single" | "bulk";

type AssignedCourse = {
  id: string;
  code: string;
  name: string;
};

export default function AllocationForm({ onClose }: Props) {
  const [mode, setMode] = useState<FormMode>("single");
  const [facultyId, setFacultyId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [semesterNumber, setSemesterNumber] = useState<number | null>(null);

  const { data: batches } = useBatches("ACTIVE");
  const { data: sections } = useEnrollmentSections(batchId || null);
  const { data: facultyData } = useFaculty({ status: "active" });

  const createMutation = useCreateAllocation();
  const bulkMutation = useBulkCreateAllocations();

  // Fetch semester number when section is selected
  useEffect(() => {
    if (sectionId) {
      apiClient
        .get(`/academics/sections/${sectionId}/semester`)
        .then((res) => setSemesterNumber(res.data.data.semesterNumber))
        .catch(() => setSemesterNumber(null));
    } else {
      setSemesterNumber(null);
    }
  }, [sectionId]);

  // Fetch assigned courses for selected batch/semester/section
  const { data: assignedCoursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["assignedCourses", batchId, semesterNumber, sectionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sectionId) {
        params.append("sectionId", sectionId);
      }
      const queryString = params.toString();
      const url = `/allocations/assigned-courses/${batchId}/${semesterNumber}${queryString ? `?${queryString}` : ""}`;
      const res = await apiClient.get(url);
      return res.data.data;
    },
    enabled: !!batchId && semesterNumber !== null && !!sectionId,
  });

  const courses: AssignedCourse[] = assignedCoursesData ?? [];
  const faculty = facultyData?.data ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facultyId) {
      alert("Please select a faculty member");
      return;
    }

    if (mode === "single") {
      if (!courseId || !sectionId) {
        alert("Please fill all required fields");
        return;
      }

      await createMutation.mutateAsync({
        facultyId,
        courseId,
        sectionId,
      });
      onClose();
    } else {
      if (courseIds.length === 0 || !sectionId) {
        alert("Please select courses and fill all required fields");
        return;
      }

      await bulkMutation.mutateAsync({
        facultyId,
        courseIds,
        sectionId,
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 600, maxHeight: "90vh", overflow: "auto" }}
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
            New Allocation
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

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={`btn ${mode === "single" ? "" : "secondary"}`}
              onClick={() => setMode("single")}
            >
              Single Course
            </button>
            <button
              type="button"
              className={`btn ${mode === "bulk" ? "" : "secondary"}`}
              onClick={() => setMode("bulk")}
            >
              Multiple Courses
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Faculty Member <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 5,
                border: "1px solid var(--line)",
                fontSize: 13,
              }}
            >
              <option value="">Select Faculty</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.employeeNumber} - {f.firstName} {f.lastName}{" "}
                  {f.designation ? `(${f.designation})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Batch <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <select
              value={batchId}
              onChange={(e) => {
                setBatchId(e.target.value);
                setSectionId("");
                setCourseId("");
                setCourseIds([]);
              }}
              required
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 5,
                border: "1px solid var(--line)",
                fontSize: 13,
              }}
            >
              <option value="">Select Batch</option>
              {batches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Section <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <select
              value={sectionId}
              onChange={(e) => {
                setSectionId(e.target.value);
                setCourseId("");
                setCourseIds([]);
              }}
              required
              disabled={!batchId}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 5,
                border: "1px solid var(--line)",
                fontSize: 13,
              }}
            >
              <option value="">Select Section</option>
              {sections?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p
              style={{
                fontSize: 11,
                color: "var(--ink-faint)",
                marginTop: 4,
                marginBottom: 0,
              }}
            >
              {semesterNumber !== null
                ? `Semester ${semesterNumber} • Showing ${courses.length} assigned course${courses.length !== 1 ? "s" : ""}`
                : "Semester is automatically determined from section's current progress"}
            </p>
          </div>

          {mode === "single" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Course <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                disabled={
                  !sectionId || isLoadingCourses || courses.length === 0
                }
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 5,
                  border: "1px solid var(--line)",
                  fontSize: 13,
                }}
              >
                <option value="">
                  {isLoadingCourses
                    ? "Loading courses..."
                    : courses.length === 0
                      ? "No courses assigned to this batch/section"
                      : "Select Course"}
                </option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "bulk" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Courses <span style={{ color: "var(--red)" }}>*</span>
              </label>
              {isLoadingCourses ? (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: "var(--ink-faint)",
                    fontSize: 13,
                    border: "1px solid var(--line)",
                    borderRadius: 5,
                  }}
                >
                  Loading courses...
                </div>
              ) : courses.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: "var(--ink-faint)",
                    fontSize: 13,
                    border: "1px solid var(--line)",
                    borderRadius: 5,
                  }}
                >
                  No courses assigned to this batch/section
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: 200,
                    overflow: "auto",
                    border: "1px solid var(--line)",
                    borderRadius: 5,
                    padding: 8,
                  }}
                >
                  {courses.map((c) => (
                    <label
                      key={c.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "4px 0",
                        fontSize: 13,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={courseIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCourseIds([...courseIds, c.id]);
                          } else {
                            setCourseIds(courseIds.filter((id) => id !== c.id));
                          }
                        }}
                      />
                      {c.code} - {c.name}
                    </label>
                  ))}
                </div>
              )}
              <p
                style={{
                  fontSize: 11,
                  color: "var(--ink-faint)",
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                {courseIds.length} selected
              </p>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              paddingTop: 16,
              borderTop: "1px solid var(--line)",
            }}
          >
            <button
              type="button"
              className="btn secondary"
              onClick={onClose}
              disabled={createMutation.isPending || bulkMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={createMutation.isPending || bulkMutation.isPending}
            >
              {createMutation.isPending || bulkMutation.isPending
                ? "Creating..."
                : "Create Allocation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
