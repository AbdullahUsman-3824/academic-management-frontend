import { useEffect, useMemo, useRef, useState } from "react";
import {
  useProgressionPreview,
  useImplementProgression,
} from "../hooks/useAcademicQueries";

interface Props {
  academicSessionId: string;
  onClose: () => void;
}

const groupKey = (batchId: string, from: number, to: number) =>
  `${batchId}:${from}:${to}`;

export function ProgressionModal({ academicSessionId, onClose }: Props) {
  const { data, isLoading, isError, error } =
    useProgressionPreview(academicSessionId);
  const implement = useImplementProgression();

  // Exclusion state (sent to the implement API on confirm)
  const [excludedGroups, setExcludedGroups] = useState<Set<string>>(new Set());
  const [excludedStudents, setExcludedStudents] = useState<Set<string>>(
    new Set(),
  );

  // UI state
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  // studentId -> overridden targetSemester (only entries that differ from default)
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [done, setDone] = useState<{
    createdCount: number;
    skippedCount: number;
  } | null>(null);

  const batches = data?.batches ?? [];

  // Final-semester groups start excluded (admin can include them manually)
  const initialized = useRef(false);
  useEffect(() => {
    if (!data || initialized.current) return;
    initialized.current = true;
    const keys = new Set<string>();
    for (const b of data.batches) {
      for (const t of b.transitions) {
        if (t.isFinal)
          keys.add(groupKey(b.batchId, t.fromSemester, t.toSemester));
      }
    }
    setExcludedGroups(keys);
  }, [data]);

  // ── Summary numbers ───────────────────────────────────────────────────────
  const summary = useMemo(() => {
    let willProgress = 0;
    let excluded = 0;
    let blocked = false;

    for (const b of batches) {
      for (const t of b.transitions) {
        const key = groupKey(b.batchId, t.fromSemester, t.toSemester);
        if (excludedGroups.has(key)) {
          excluded += t.count;
          continue;
        }
        const ex = t.students.filter((s) =>
          excludedStudents.has(s.studentId),
        ).length;
        excluded += ex;
        willProgress += t.count - ex;
        if (t.missingTargetSemester && t.count - ex > 0) blocked = true;
      }
    }
    return { willProgress, excluded, blocked };
  }, [batches, excludedGroups, excludedStudents]);

  // ── Toggles ───────────────────────────────────────────────────────────────
  const toggleGroup = (
    batchId: string,
    t: (typeof batches)[number]["transitions"][number],
  ) => {
    const key = groupKey(batchId, t.fromSemester, t.toSemester);

    setExcludedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

    // Group level change resets individual exclusions of this group
    setExcludedStudents((prev) => {
      const next = new Set(prev);
      for (const s of t.students) next.delete(s.studentId);
      return next;
    });
  };

  const toggleBatch = (b: (typeof batches)[number]) => {
    const keys = b.transitions.map((t) =>
      groupKey(b.batchId, t.fromSemester, t.toSemester),
    );
    const allExcluded = keys.every((k) => excludedGroups.has(k));

    setExcludedGroups((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (allExcluded) next.delete(k);
        else next.add(k);
      }
      return next;
    });

    setExcludedStudents((prev) => {
      const next = new Set(prev);
      for (const t of b.transitions) {
        for (const s of t.students) next.delete(s.studentId);
      }
      return next;
    });
  };

  const toggleStudent = (studentId: string) => {
    setExcludedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleOverride = (
    studentId: string,
    value: number,
    defaultValue: number,
  ) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (value === defaultValue) delete next[studentId];
      else next[studentId] = value;
      return next;
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleImplement = () => {
    const excludedGroupsPayload: {
      batchId: string;
      fromSemester: number;
      toSemester: number;
    }[] = [];
    const excludedStudentIds: string[] = [];
    const fullyExcludedIds = new Set<string>();

    for (const b of batches) {
      for (const t of b.transitions) {
        const key = groupKey(b.batchId, t.fromSemester, t.toSemester);
        if (excludedGroups.has(key)) {
          excludedGroupsPayload.push({
            batchId: b.batchId,
            fromSemester: t.fromSemester,
            toSemester: t.toSemester,
          });
          t.students.forEach((s) => fullyExcludedIds.add(s.studentId));
        } else {
          for (const s of t.students) {
            if (excludedStudents.has(s.studentId)) {
              excludedStudentIds.push(s.studentId);
              fullyExcludedIds.add(s.studentId);
            }
          }
        }
      }
    }

    // Only send adjustments for students who will actually progress
    const adjustments = Object.entries(overrides)
      .filter(([studentId]) => !fullyExcludedIds.has(studentId))
      .map(([studentId, targetSemester]) => ({ studentId, targetSemester }));

    implement.mutate(
      {
        academicSessionId,
        adjustments: adjustments.length ? adjustments : undefined,
        excludedGroups: excludedGroupsPayload.length
          ? excludedGroupsPayload
          : undefined,
        excludedStudentIds: excludedStudentIds.length
          ? excludedStudentIds
          : undefined,
      },
      {
        onSuccess: (res) => {
          setConfirmOpen(false);
          setDone({
            createdCount: res.createdCount,
            skippedCount: res.skippedCount ?? 0,
          });
        },
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
        style={{
          width: "min(900px, 100%)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="card-head">
          <h2>Run Progression</h2>
          <button
            type="button"
            className="btn secondary"
            onClick={onClose}
            disabled={implement.isPending}
          >
            Close
          </button>
        </div>

        <div className="card-body" style={{ overflowY: "auto" }}>
          {isLoading && (
            <p style={{ color: "var(--ink-faint)" }}>Loading preview…</p>
          )}
          {isError && (
            <p style={{ color: "crimson" }}>
              {(error as Error)?.message ??
                "Failed to load progression preview."}
            </p>
          )}

          {done && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
              <h3 style={{ margin: "0 0 6px" }}>Progression complete</h3>
              <p style={{ color: "var(--ink-faint)" }}>
                {done.createdCount} student record
                {done.createdCount === 1 ? "" : "s"} created for{" "}
                {data?.academicSessionName}
                {done.skippedCount > 0 && `, ${done.skippedCount} skipped`}.
              </p>
              <button
                type="button"
                className="btn"
                style={{ marginTop: 16 }}
                onClick={onClose}
              >
                Done
              </button>
            </div>
          )}

          {!done && data && (
            <>
              <p
                style={{
                  color: "var(--ink-faint)",
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
                Progressing students into{" "}
                <strong>{data.academicSessionName}</strong>. Section stays
                unchanged. Untick a batch or a semester group to skip it, or
                expand a group to skip individual students or change a student's
                target semester.
              </p>

              {/* Summary */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  padding: "10px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
                <span>
                  Total: <strong>{data.totalStudents}</strong>
                </span>
                <span>
                  Will progress: <strong>{summary.willProgress}</strong>
                </span>
                <span>
                  Excluded: <strong>{summary.excluded}</strong>
                </span>
              </div>

              {summary.blocked && (
                <div
                  style={{
                    background: "#FBE9E7",
                    border: "1px solid #F3C2BA",
                    borderRadius: 6,
                    padding: "8px 12px",
                    fontSize: 12,
                    color: "#A63A28",
                    marginBottom: 16,
                  }}
                >
                  Some included groups have a target semester that does not
                  exist in the database. Exclude them or add the semester first.
                </div>
              )}

              {data.totalStudents === 0 && (
                <p style={{ color: "var(--ink-faint)" }}>
                  No eligible students found for this session.
                </p>
              )}

              {batches.map((b) => {
                const keys = b.transitions.map((t) =>
                  groupKey(b.batchId, t.fromSemester, t.toSemester),
                );
                const allExcluded = keys.every((k) => excludedGroups.has(k));

                return (
                  <div
                    key={b.batchId}
                    style={{
                      marginBottom: 20,
                      border: "1px solid var(--line)",
                      borderRadius: 6,
                    }}
                  >
                    {/* Batch header */}
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!allExcluded}
                        onChange={() => toggleBatch(b)}
                      />
                      <strong style={{ fontSize: 14 }}>{b.batchName}</strong>
                      <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>
                        {b.totalStudents} students
                      </span>
                    </label>

                    {/* Transitions */}
                    {b.transitions.map((t) => {
                      const key = groupKey(
                        b.batchId,
                        t.fromSemester,
                        t.toSemester,
                      );
                      const groupExcluded = excludedGroups.has(key);
                      const isOpen = expanded.has(key);
                      const excludedInGroup = t.students.filter((s) =>
                        excludedStudents.has(s.studentId),
                      ).length;

                      return (
                        <div
                          key={key}
                          style={{ borderBottom: "1px solid var(--line)" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 12px",
                              opacity: groupExcluded ? 0.55 : 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={!groupExcluded}
                              onChange={() => toggleGroup(b.batchId, t)}
                            />
                            <span style={{ fontSize: 13 }}>
                              Sem {t.fromSemester} → Sem {t.toSemester}
                            </span>
                            <span
                              style={{
                                color: "var(--ink-faint)",
                                fontSize: 12,
                              }}
                            >
                              {t.count} student{t.count !== 1 ? "s" : ""}
                              {excludedInGroup > 0 &&
                                !groupExcluded &&
                                `, ${excludedInGroup} excluded`}
                            </span>
                            {t.isFinal && (
                              <span
                                style={{
                                  fontSize: 11,
                                  background: "#FBF3DF",
                                  color: "#8A6A1F",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                }}
                              >
                                Final semester, stays same
                              </span>
                            )}
                            {t.missingTargetSemester && (
                              <span
                                style={{
                                  fontSize: 11,
                                  background: "#FBE9E7",
                                  color: "#A63A28",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                }}
                              >
                                Target semester missing
                              </span>
                            )}
                            <button
                              type="button"
                              className="btn secondary"
                              style={{
                                marginLeft: "auto",
                                padding: "3px 10px",
                                fontSize: 12,
                              }}
                              onClick={() => toggleExpanded(key)}
                            >
                              {isOpen ? "Hide students" : "View students"}
                            </button>
                          </div>

                          {isOpen && (
                            <div className="table-scroll">
                              <table>
                                <thead>
                                  <tr>
                                    <th></th>
                                    <th>Reg. No</th>
                                    <th>Name</th>
                                    <th>Target Sem</th>
                                    <th>Section (kept as-is)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {t.students.map((s) => {
                                    const studentExcluded =
                                      groupExcluded ||
                                      excludedStudents.has(s.studentId);
                                    return (
                                      <tr
                                        key={s.studentId}
                                        style={{
                                          opacity: studentExcluded ? 0.5 : 1,
                                        }}
                                      >
                                        <td>
                                          <input
                                            type="checkbox"
                                            checked={!studentExcluded}
                                            disabled={groupExcluded}
                                            onChange={() =>
                                              toggleStudent(s.studentId)
                                            }
                                          />
                                        </td>
                                        <td className="subj-title">
                                          {s.regNumber}
                                        </td>
                                        <td>{s.fullName}</td>
                                        <td>
                                          <input
                                            type="number"
                                            min={1}
                                            max={12}
                                            disabled={studentExcluded}
                                            value={
                                              overrides[s.studentId] ??
                                              t.toSemester
                                            }
                                            onChange={(e) =>
                                              handleOverride(
                                                s.studentId,
                                                Number(e.target.value),
                                                t.toSemester,
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
                                        <td className="subj-sub">
                                          {s.currentSectionName ?? "-"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {implement.isError && (
                <p style={{ color: "crimson", marginBottom: 12 }}>
                  {(implement.error as Error)?.message ??
                    "Failed to implement progression."}
                </p>
              )}

              <button
                type="button"
                className="btn"
                disabled={
                  implement.isPending ||
                  summary.willProgress === 0 ||
                  summary.blocked
                }
                onClick={() => setConfirmOpen(true)}
              >
                {implement.isPending
                  ? "Implementing…"
                  : `Implement for ${summary.willProgress} students`}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Confirm dialog ─────────────────────────────────────────────── */}
      {confirmOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: 20,
          }}
          onClick={
            implement.isPending ? undefined : () => setConfirmOpen(false)
          }
        >
          <div
            className="card"
            style={{ width: "min(440px, 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-head">
              <h2>Confirm Progression</h2>
            </div>

            <div className="card-body">
              <p
                style={{
                  margin: "0 0 18px",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--ink-soft)",
                }}
              >
                This will create{" "}
                <strong style={{ color: "var(--ink)" }}>
                  {summary.willProgress}
                </strong>{" "}
                permanent academic record
                {summary.willProgress === 1 ? "" : "s"}
                {summary.excluded > 0 && (
                  <>
                    {" "}
                    (<strong>{summary.excluded}</strong> excluded)
                  </>
                )}{" "}
                and lock this session for progression. Continue?
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setConfirmOpen(false)}
                  disabled={implement.isPending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleImplement}
                  disabled={implement.isPending}
                >
                  {implement.isPending ? "Implementing…" : "Implement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
