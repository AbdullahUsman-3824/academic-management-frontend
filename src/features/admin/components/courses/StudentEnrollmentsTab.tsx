import { useState } from "react";
import { courseManagementStore } from "../../data/courseManagementStore";

type EnrollmentSubTab = "regular" | "repeat" | "overview";

export default function StudentEnrollmentsTab() {
  const [subTab, setSubTab] = useState<EnrollmentSubTab>("regular");
  const [batchId, setBatchId] = useState(courseManagementStore.batches[0].id);
  const [sessionId, setSessionId] = useState(courseManagementStore.sessions[0].id);
  const [semesterNumber, setSemesterNumber] = useState(2);
  const [repeatStudentId, setRepeatStudentId] = useState("enrollment-3");
  const [repeatCourseId, setRepeatCourseId] = useState("course-cs301");
  const [repeatSectionId, setRepeatSectionId] = useState("section-b");
  const [, rerender] = useState(0);

  const curriculum = courseManagementStore.curricula.find((item) => item.batchId === batchId);
  const semester = curriculum?.semesters.find((item) => item.semesterNumber === semesterNumber);
  const regular = courseManagementStore.enrollments.filter((item) => item.batchId === batchId && item.semesterNumber === semesterNumber && !item.isRepeat);
  const confirmed = regular.filter((item) => item.status === "confirmed").length;

  const confirmEnrollments = () => {
    if (!window.confirm(`Confirm Semester ${semesterNumber} enrollments for ${curriculum?.batchName}? Confirmed courses will become visible in student portals.`)) return;
    regular.forEach((item) => {
      item.status = "confirmed";
      item.visibleInStudentPortal = true;
    });
    rerender((value) => value + 1);
  };

  const validRepeatAllocations = courseManagementStore.allocations.filter((item) =>
    item.academicSessionId === sessionId &&
    item.courseId === repeatCourseId &&
    item.status === "allocated"
  );

  const addRepeatEnrollment = () => {
    const student = courseManagementStore.enrollments.find((item) => item.id === repeatStudentId);
    const allocation = validRepeatAllocations.find((item) => item.sectionId === repeatSectionId);
    if (!student || !allocation) {
      window.alert("Select a student and an existing allocated section.");
      return;
    }
    courseManagementStore.enrollments.push({
      ...student,
      id: `repeat-${Date.now()}`,
      courseIds: [repeatCourseId],
      isRepeat: true,
      status: "confirmed",
      visibleInStudentPortal: true,
      allocationId: allocation.id,
    });
    rerender((value) => value + 1);
    window.alert("Repeat enrollment confirmed using the selected existing course allocation.");
  };

  return (
    <>
      <div className="tabs-row" style={{ borderBottom: "1px solid var(--line)" }}>
        {([
          ["regular", "Regular Enrollments"],
          ["repeat", "Repeat Courses"],
          ["overview", "Enrollment Overview / Confirmation"],
        ] as const).map(([key, label]) => <button key={key} type="button" className={`tab-btn${subTab === key ? " active" : ""}`} onClick={() => setSubTab(key)}>{label}</button>)}
      </div>

      {subTab !== "repeat" && (
        <div className="card-head" style={{ borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={sessionId} onChange={(event) => setSessionId(event.target.value)} aria-label="Academic session" style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid var(--line)" }}>
              {courseManagementStore.sessions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={batchId} onChange={(event) => { setBatchId(event.target.value); setSemesterNumber(1); }} aria-label="Batch" style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid var(--line)" }}>
              {courseManagementStore.batches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={semesterNumber} onChange={(event) => setSemesterNumber(Number(event.target.value))} aria-label="Semester" style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid var(--line)" }}>
              {(curriculum?.semesters ?? []).map((item) => <option key={item.semesterNumber} value={item.semesterNumber}>Semester {item.semesterNumber}</option>)}
            </select>
          </div>
          {subTab === "regular" && <button type="button" className="btn" onClick={confirmEnrollments}>Confirm Semester Enrollment</button>}
        </div>
      )}

      {subTab === "regular" && (
        <>
          <div className="card-body" style={{ display: "flex", gap: 24, flexWrap: "wrap", borderBottom: "1px solid var(--line)" }}>
            <span><strong>{regular.length}</strong> students</span>
            <span><strong>{semester?.courses.length ?? 0}</strong> curriculum courses</span>
            <span><strong>{regular.length * (semester?.courses.length ?? 0)}</strong> enrollment records</span>
            <span><strong>{confirmed}</strong> confirmed</span>
            <span><strong>{regular.length - confirmed}</strong> pending</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Student</th><th>Registration No.</th><th>Courses</th><th>Status</th><th>Portal</th></tr></thead>
              <tbody>
                {regular.map((item) => (
                  <tr key={item.id}><td className="subj-title">{item.studentName}</td><td>{item.registrationNo}</td><td>{item.courseIds.length}</td><td><span className={`status ${item.status === "confirmed" ? "active" : "pending"}`}>{item.status === "confirmed" ? "Confirmed" : "Pending"}</span></td><td>{item.visibleInStudentPortal ? "Visible" : "Hidden until confirmed"}</td></tr>
                ))}
                {regular.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--ink-faint)", padding: 32 }}>No regular enrollments have been generated for this context.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {subTab === "repeat" && (
        <>
          <div className="card-head" style={{ borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select value={repeatStudentId} onChange={(event) => setRepeatStudentId(event.target.value)} aria-label="Student" style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid var(--line)" }}>
                {courseManagementStore.enrollments.filter((item) => item.failedCourseIds?.length).map((item) => <option key={item.id} value={item.id}>{item.studentName} · {item.registrationNo}</option>)}
              </select>
              <select value={repeatCourseId} onChange={(event) => setRepeatCourseId(event.target.value)} aria-label="Failed course" style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid var(--line)" }}>
                {courseManagementStore.courses.filter((item) => item.id === "course-cs301").map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}
              </select>
            </div>
          </div>
          <div className="card-body">
            <h3 style={{ marginTop: 0 }}>Existing course allocations</h3>
            {validRepeatAllocations.length === 0 ? (
              <p style={{ color: "var(--ink-faint)" }}>No valid existing allocation is available for this failed course.</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {validRepeatAllocations.map((allocation) => {
                  const faculty = courseManagementStore.faculty.find((item) => item.id === allocation.facultyId);
                  const section = courseManagementStore.sections.find((item) => item.id === allocation.sectionId);
                  return (
                    <label key={allocation.id} style={{ display: "flex", gap: 10, alignItems: "center", border: "1px solid var(--line)", borderRadius: 5, padding: 10 }}>
                      <input type="radio" name="repeat-section" value={allocation.sectionId} checked={repeatSectionId === allocation.sectionId} onChange={(event) => setRepeatSectionId(event.target.value)} />
                      <span><strong>Section {section?.name}</strong> · {faculty?.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <button type="button" className="btn" style={{ marginTop: 16 }} disabled={validRepeatAllocations.length === 0} onClick={addRepeatEnrollment}>Confirm Repeat Enrollment</button>
          </div>
        </>
      )}

      {subTab === "overview" && (
        <div className="table-scroll">
          <table>
            <thead><tr><th>Batch</th><th>Semester</th><th>Students</th><th>Enrollments</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {courseManagementStore.batches.map((batch) => {
                const curriculumItem = courseManagementStore.curricula.find((item) => item.batchId === batch.id);
                const semesterItem = curriculumItem?.semesters.find((item) => item.status === "active") ?? curriculumItem?.semesters[0];
                const rows = courseManagementStore.enrollments.filter((item) => item.batchId === batch.id && item.semesterNumber === semesterItem?.semesterNumber);
                const confirmedRow = rows.every((item) => item.status === "confirmed") && rows.length > 0;
                return <tr key={batch.id}><td className="subj-title">{batch.name}</td><td>{semesterItem?.semesterNumber ?? "-"}</td><td>{rows.length}</td><td>{rows.length * (semesterItem?.courses.length ?? 0)}</td><td><span className={`status ${confirmedRow ? "active" : "pending"}`}>{confirmedRow ? "Confirmed" : "Pending Confirmation"}</span></td><td><button type="button" className="btn secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => { setBatchId(batch.id); setSemesterNumber(semesterItem?.semesterNumber ?? 1); setSubTab("regular"); }}>Review</button></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
