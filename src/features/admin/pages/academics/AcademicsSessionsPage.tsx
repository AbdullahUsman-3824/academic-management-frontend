import { useState } from "react";
import type { AcademicSessionStatus } from "../../api/academic";
import {
  useSessions,
  useActivateSession,
  useCompleteSession,
  useYears,
} from "../../hooks/useAcademicQueries";
import { StatusFilterBar } from "../../components/StatusFilterBar";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { formatDate, sessionStatusClass } from "./helpers";
import { SessionDetail } from "./sessions/SessionDetail";
import { SessionEdit } from "./sessions/SessionEdit";

const SESSION_STATUS_OPTIONS = [
  { value: "all",       label: "All statuses" },
  { value: "upcoming",  label: "Upcoming" },
  { value: "active",    label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AcademicsSessionsPage() {
  const [sessionStatus, setSessionStatus] = useState<AcademicSessionStatus | "all">("all");
  const [sessionYearId, setSessionYearId] = useState<string | "all">("all");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId]   = useState<string | null>(null);

  const allYears = useYears("all");
  const { data, isLoading, isError, error, refetch } = useSessions({
    status: sessionStatus,
    academicYearId: sessionYearId,
  });

  const activate = useActivateSession();
  const complete = useCompleteSession();

  // Build the year filter options dynamically from fetched years
  const yearOptions = [
    { value: "all", label: "All years" },
    ...(allYears.data?.map((y) => ({ value: y.id, label: y.name })) ?? []),
  ];

  return (
    <>
      {/* ── Filters ─────────────────────────────────────────── */}
      <StatusFilterBar
        filters={[
          {
            id: "status",
            label: "Status",
            value: sessionStatus,
            options: SESSION_STATUS_OPTIONS,
            onChange: (v) => setSessionStatus(v as AcademicSessionStatus | "all"),
          },
          {
            id: "year",
            label: "Academic Year",
            value: sessionYearId,
            options: yearOptions,
            onChange: (v) => setSessionYearId(v),
          },
        ]}
        onRefresh={() => refetch()}
        meta={
          isLoading
            ? null
            : `${data?.length ?? 0} session${(data?.length ?? 0) !== 1 ? "s" : ""}${sessionStatus !== "all" ? ` · ${sessionStatus}` : ""}`
        }
      />

      {/* ── Error state ─────────────────────────────────────── */}
      {isError && (
        <div className="card-body">
          <p style={{ color: "var(--ink-faint)", marginBottom: 12 }}>
            {(error as Error)?.message}
          </p>
          <button type="button" className="btn secondary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {/* ── Loading state ───────────────────────────────────── */}
      {isLoading && <LoadingSpinner label="Loading sessions…" />}

      {/* ── Table ───────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th className="col-hide-sm">Start</th>
                <th className="col-hide-sm">End</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", color: "var(--ink-faint)", fontStyle: "italic" }}
                  >
                    No sessions found
                  </td>
                </tr>
              )}
              {data?.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="subj-title">{s.name}</div>
                  </td>
                  <td className="subj-sub">{s.academicYear?.name ?? "—"}</td>
                  <td className="subj-sub col-hide-sm">{formatDate(s.startDate)}</td>
                  <td className="subj-sub col-hide-sm">{formatDate(s.endDate)}</td>
                  <td>
                    <span className={`status ${sessionStatusClass[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => setSelectedSessionId(s.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => setEditingSessionId(s.id)}
                      >
                        Edit
                      </button>
                      {s.status === "upcoming" && (
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          disabled={activate.isPending}
                          onClick={() => activate.mutate(s.id)}
                        >
                          Activate
                        </button>
                      )}
                      {s.status === "active" && (
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          disabled={complete.isPending}
                          onClick={() => complete.mutate(s.id)}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail / Edit overlays ──────────────────────────── */}
      {selectedSessionId && (
        <SessionDetail
          id={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
        />
      )}
      {editingSessionId && (
        <SessionEdit
          id={editingSessionId}
          years={allYears.data ?? []}
          onClose={() => setEditingSessionId(null)}
        />
      )}
    </>
  );
}
