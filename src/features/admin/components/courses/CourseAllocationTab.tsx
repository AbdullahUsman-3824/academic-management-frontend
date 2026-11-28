import { useState } from "react";
import { courseManagementStore } from "../../data/courseManagementStore";

export default function CourseAllocationTab() {
  const [sessionId, setSessionId] = useState(courseManagementStore.sessions[0].id);
  const [batchId, setBatchId] = useState(courseManagementStore.batches[0].id);
  const [semesterNumber, setSemesterNumber] = useState(2);
  const [sectionId, setSectionId] = useState(courseManagementStore.sections[0].id);
  const [, rerender] = useState(0);

  const curriculum = courseManagementStore.curricula.find((item) => item.batchId === batchId);
  const semester = curriculum?.semesters.find((item) => item.semesterNumber === semesterNumber);
  const courses = semester?.courses ?? [];

  const getAllocation = (courseId: string) =>
    courseManagementStore.allocations.find((item) =>
      item.academicSessionId === sessionId &&
      item.batchId === batchId &&
      item.semesterNumber === semesterNumber &&
      item.sectionId === sectionId &&
      item.courseId === courseId
    );

  const setFaculty = (courseId: string, facultyId: string) => {
    const existing = getAllocation(courseId);
    if (existing) {
      existing.facultyId = facultyId || null;
      existing.status = facultyId ? "allocated" : "unallocated";
    } else if (facultyId) {
      courseManagementStore.allocations.push({
        id: `allocation-${Date.now()}`,
        academicSessionId: sessionId,
        batchId,
        semesterNumber,
        sectionId,
        courseId,
        facultyId,
        status: "allocated",
      });
    }
    rerender((value) => value + 1);
  };

  const allocatedCount = courses.filter((course) => getAllocation(course.courseId)?.status === "allocated").length;

  const saveAllocations = () => {
    if (allocatedCount !== courses.length) {
      window.alert("Every course must have an active faculty member before saving.");
      return;
    }
    window.alert("Course allocations saved. Student course faculty information is now updated.");
  };

  return (
    <>
      <div className="card-head" style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select aria-label="Academic session" value={sessionId} onChange={(event) => setSessionId(event.target.value)} style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid var(--line)" }}>
            {courseManagementStore.sessions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select aria-label="Batch" value={batchId} onChange={(event) => { setBatchId(event.target.value); setSemesterNumber(1); }} style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid var(--line)" }}>
            {courseManagementStore.batches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select aria-label="Semester" value={semesterNumber} onChange={(event) => setSemesterNumber(Number(event.target.value))} style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid var(--line)" }}>
            {(curriculum?.semesters ?? []).map((item) => <option key={item.semesterNumber} value={item.semesterNumber}>Semester {item.semesterNumber}</option>)}
          </select>
          <select aria-label="Section" value={sectionId} onChange={(event) => setSectionId(event.target.value)} style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid var(--line)" }}>
            {courseManagementStore.sections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
      </div>
      <div className="card-head" style={{ borderBottom: "1px solid var(--line)" }}>
        <span className="meta">{courses.length} total · {allocatedCount} allocated · {Math.max(courses.length - allocatedCount, 0)} pending</span>
        <button type="button" className="btn" onClick={saveAllocations}>Save Allocation</button>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>Course</th><th>Code</th><th>Credit Hours</th><th>Faculty</th><th>Workload</th><th>Status</th></tr></thead>
          <tbody>
            {courses.map((course) => {
              const allocation = getAllocation(course.courseId);
              const selectedFaculty = courseManagementStore.faculty.find((item) => item.id === allocation?.facultyId);
              return (
                <tr key={course.courseId}>
                  <td className="subj-title">{course.name}</td>
                  <td>{course.code}</td>
                  <td>{course.creditHours}</td>
                  <td>
                    <select value={allocation?.facultyId ?? ""} onChange={(event) => setFaculty(course.courseId, event.target.value)} style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid var(--line)", maxWidth: 220 }}>
                      <option value="">Select faculty</option>
                      {courseManagementStore.faculty.filter((item) => item.status === "active").map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name} · {faculty.employeeNumber} · {faculty.workload} classes</option>)}
                    </select>
                  </td>
                  <td>{selectedFaculty ? `${selectedFaculty.workload} classes` : "—"}</td>
                  <td><span className={`status ${allocation?.status === "allocated" ? "active" : "pending"}`}>{allocation?.status === "allocated" ? "Allocated" : "Unallocated"}</span></td>
                </tr>
              );
            })}
            {courses.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--ink-faint)", padding: 32 }}>No curriculum courses are available for this context.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
