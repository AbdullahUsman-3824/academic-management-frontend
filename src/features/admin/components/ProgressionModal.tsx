import { useMemo, useState } from "react";
import {
  useProgressionPreview,
  useImplementProgression,
} from "../hooks/useAcademicQueries";

interface Props {
  academicSessionId: string;
  onClose: () => void;
}

export function ProgressionModal({ academicSessionId, onClose }: Props) {
  const { data, isLoading, isError, error } = useProgressionPreview(academicSessionId);
  const implement = useImplementProgression();

  // studentId → overridden targetSemester (only entries that differ from default)
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [done, setDone] = useState<{ createdCount: number } | null>(null);

  const batches = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, { batchId: string; batchName: string; students: typeof data.students }>();
    for (const s of data.students) {
      if (!map.has(s.batchId)) {
        map.set(s.batchId, { batchId: s.batchId, batchName: s.batchName, students: [] });
      }
      map.get(s.batchId)!.students.push(s);
    }
    return Array.from(map.values());
  }, [data]);

  const handleOverride = (studentId: string, value: number, defaultValue: number) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (value === defaultValue) {
        delete next[studentId];
      } else {
        next[studentId] = value;
      }
      return next;
    });
  };

  const handleImplement = () => {
    const adjustments = Object.entries(overrides).map(([studentId, targetSemester]) => ({
      studentId,
      targetSemester,
    }));
    implement.mutate(
      { academicSessionId, adjustments: adjustments.length ? adjustments : undefined },
      {
        onSuccess: (res) => setDone({ createdCount: res.createdCount }),
      },
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{ width: "min(900px, 100%)", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
      >
        <div className="card-head">
          <h2>Run Progression</h2>
          <button type="button" className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="card-body" style={{ overflowY: "auto" }}>
          {isLoading && <p style={{ color: "var(--ink-faint)" }}>Loading preview…</p>}
          {isError && (
            <p style={{ color: "crimson" }}>
              {(error as Error)?.message ?? "Failed to load progression preview."}
            </p>
          )}

          {done && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
              <h3 style={{ margin: "0 0 6px" }}>Progression complete</h3>
              <p style={{ color: "var(--ink-faint)" }}>
                {done.createdCount} student record{done.createdCount === 1 ? "" : "s"} created for{" "}
                {data?.academicSessionName}.
              </p>
              <button type="button" className="btn" style={{ marginTop: 16 }} onClick={onClose}>
                Done
              </button>
            </div>
          )}

          {!done && data && (
            <>
              <p style={{ color: "var(--ink-faint)", marginBottom: 16, fontSize: 13 }}>
                Progressing <strong>{data.totalStudents}</strong> students into{" "}
                <strong>{data.academicSessionName}</strong>. Section stays unchanged for
                everyone. You can override an individual student's target semester below —
                everyone else gets current + 1 automatically.
              </p>

              <div
                style={{
                  background: "#FBF3DF",
                  border: "1px solid #F0DDA8",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "#8A6A1F",
                  marginBottom: 16,
                }}
              >
                Excluding a student entirely, or overriding their section during
                progression, isn't supported by the backend yet — every eligible
                student listed below <em>will</em> get a record created. Only the
                semester can be adjusted per student for now.
              </div>

              {batches.map((b) => (
                <div key={b.batchId} style={{ marginBottom: 24 }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>
                    {b.batchName} ({b.students.length})
                  </h4>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Reg. No</th>
                          <th>Name</th>
                          <th>Current Sem</th>
                          <th>Target Sem</th>
                          <th>Section (kept as-is)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.students.map((s) => (
                          <tr key={s.studentId}>
                            <td className="subj-title">{s.regNumber}</td>
                            <td>{s.fullName}</td>
                            <td>{s.currentSemester}</td>
                            <td>
                              <input
                                type="number"
                                min={1}
                                max={12}
                                value={overrides[s.studentId] ?? s.targetSemester}
                                onChange={(e) =>
                                  handleOverride(
                                    s.studentId,
                                    Number(e.target.value),
                                    s.targetSemester,
                                  )
                                }
                                style={{
                                  width: 60,
                                  padding: "3px 6px",
                                  border: "1px solid var(--line)",
                                  borderRadius: 4,
                                  fontSize: 12.5,
                                }}
                              />
                            </td>
                            <td className="subj-sub">{s.currentSectionName ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {implement.isError && (
                <p style={{ color: "crimson", marginBottom: 12 }}>
                  {(implement.error as Error)?.message ?? "Failed to implement progression."}
                </p>
              )}

              <button
                type="button"
                className="btn"
                disabled={implement.isPending || data.totalStudents === 0}
                onClick={() => {
                  if (
                    window.confirm(
                      `This will create ${data.totalStudents} permanent academic records and lock this session for progression. Continue?`,
                    )
                  ) {
                    handleImplement();
                  }
                }}
              >
                {implement.isPending ? "Implementing…" : `Implement for ${data.totalStudents} students`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}