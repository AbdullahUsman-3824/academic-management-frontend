import { useState } from "react";
import { courseManagementStore } from "../../data/courseManagementStore";

type CourseManagementTab = "curriculum" | "allocations" | "enrollments";

type StatCard = {
  label: string;
  value: number;
  tab: CourseManagementTab;
};

export default function CourseManagementOverview({
  onNavigate,
}: {
  onNavigate: (tab: CourseManagementTab) => void;
}) {
  const sessions = courseManagementStore.sessions;
  const [sessionId, setSessionId] = useState(() => sessions[0]?.id ?? "");
  const session = sessions.find((item) => item.id === sessionId);

  const totalCourses = courseManagementStore.courses.length;
  const allocated = courseManagementStore.allocations.filter(
    (item) => item.status === "allocated",
  ).length;
  const pending = courseManagementStore.allocations.filter(
    (item) => item.status === "unallocated",
  ).length;
  const totalEnrollments = courseManagementStore.enrollments.length;

  const stats: StatCard[] = [
    { label: "Total Courses", value: totalCourses, tab: "curriculum" },
    { label: "Allocated Classes", value: allocated, tab: "allocations" },
    { label: "Pending Allocations", value: pending, tab: "allocations" },
    {
      label: "Total Student Enrollments",
      value: totalEnrollments,
      tab: "enrollments",
    },
  ];

  const progressRows = courseManagementStore.batches.map((batch) => {
    const curriculum = courseManagementStore.curricula.find(
      (item) => item.batchId === batch.id,
    );
    const semester =
      curriculum?.semesters.find((item) => item.status === "active") ??
      curriculum?.semesters[0];

    const semesterAllocations = courseManagementStore.allocations.filter(
      (item) =>
        item.batchId === batch.id &&
        item.semesterNumber === semester?.semesterNumber,
    );

    const total = semester?.courses.length ?? 0;
    // Clamp so "Allocated" can never exceed "Total Courses"
    const allocatedCount = Math.min(
      semesterAllocations.filter((item) => item.status === "allocated").length,
      total,
    );

    const enrollment = courseManagementStore.enrollments.find(
      (item) =>
        item.batchId === batch.id &&
        item.semesterNumber === semester?.semesterNumber,
    );
    const isConfirmed = enrollment?.status?.toLowerCase() === "confirmed";

    return {
      batch,
      semester,
      total,
      allocated: allocatedCount,
      pending: Math.max(total - allocatedCount, 0),
      status: isConfirmed ? "Confirmed" : "Pending Confirmation",
    };
  });

  return (
    <>
      <div
        className="card-head"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <h2 style={{ margin: 0, fontSize: 16 }}>Academic Session</h2>
        <select
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value)}
          aria-label="Academic session"
          disabled={sessions.length === 0}
          style={{
            padding: "6px 10px",
            borderRadius: 5,
            border: "1px solid var(--line)",
          }}
        >
          {sessions.length === 0 && (
            <option value="">No sessions available</option>
          )}
          {sessions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card-body">
        <p className="meta" style={{ margin: "0 0 12px" }}>
          Course operations overview for{" "}
          {session?.name ?? "the selected session"}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          {stats.map(({ label, value, tab }) => (
            <div
              key={label}
              tabIndex={0}
              onClick={() => onNavigate(tab)}
              className="card"
              style={{
                textAlign: "left",
                cursor: "pointer",
                border: "1px solid var(--line)",
                background: "var(--paper)",
              }}
            >
              <div className="card-body" style={{ padding: 14 }}>
                <div className="meta">{label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Batch</th>
              <th>Semester</th>
              <th>Total Courses</th>
              <th>Allocated</th>
              <th>Pending</th>
              <th>Enrollment Status</th>
            </tr>
          </thead>
          <tbody>
            {progressRows.length === 0 && (
              <tr>
                <td colSpan={6} className="meta">
                  No batches found for this session.
                </td>
              </tr>
            )}
            {progressRows.map((row) => (
              <tr key={row.batch.id}>
                <td className="subj-title">{row.batch.name}</td>
                <td>
                  {row.semester
                    ? `Semester ${row.semester.semesterNumber}`
                    : "—"}
                </td>
                <td>{row.total}</td>
                <td>{row.allocated}</td>
                <td>{row.pending}</td>
                <td>
                  <span
                    className={`status ${row.status === "Confirmed" ? "active" : "pending"}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="card-body"
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <button
          className="btn"
          type="button"
          onClick={() => onNavigate("curriculum")}
        >
          Review Curricula
        </button>
        <button
          className="btn secondary"
          type="button"
          onClick={() => onNavigate("allocations")}
        >
          Complete Allocations
        </button>
        <button
          className="btn secondary"
          type="button"
          onClick={() => onNavigate("enrollments")}
        >
          Confirm Enrollments
        </button>
      </div>
    </>
  );
}
