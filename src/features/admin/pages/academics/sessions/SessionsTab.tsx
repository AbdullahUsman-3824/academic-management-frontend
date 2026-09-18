import type { AcademicSessionStatus } from "../../../api/academic";
import {
  useSessions,
  useActivateSession,
  useCompleteSession,
} from "../../../hooks/useAcademicQueries";
import { formatDate, sessionStatusClass, inputStyle } from "../helpers";

export function SessionsTab({
  sessionStatus,
  setSessionStatus,
  sessionYearId,
  setSessionYearId,
  years,
  sessionsQuery,
  onView,
  onEdit,
}: {
  sessionStatus: AcademicSessionStatus | "all";
  setSessionStatus: (s: AcademicSessionStatus | "all") => void;
  sessionYearId: string | "all";
  setSessionYearId: (id: string | "all") => void;
  years: { id: string; name: string }[];
  sessionsQuery: ReturnType<typeof useSessions>;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const { data, isLoading, isError, error, refetch } = sessionsQuery;
  const activate = useActivateSession();
  const complete = useCompleteSession();

  const statuses: (AcademicSessionStatus | "all")[] = [
    "all",
    "upcoming",
    "active",
    "completed",
    "cancelled",
  ];

  return (
    <>
      <div className="tabs-row" style={{ borderTop: "1px solid var(--line)" }}>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            className={`tab-btn${sessionStatus === s ? " active" : ""}`}
            onClick={() => setSessionStatus(s)}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div
        className="card-head"
        style={{ borderTop: "none", borderBottom: "1px solid var(--line)" }}
      >
        <span className="meta">
          {isLoading
            ? "Loading…"
            : `${data?.length ?? 0} session${(data?.length ?? 0) !== 1 ? "s" : ""}`}
          {sessionStatus !== "all" ? ` · ${sessionStatus}` : ""}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={sessionYearId}
            onChange={(e) => setSessionYearId(e.target.value as string | "all")}
            style={inputStyle}
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn secondary"
            onClick={() => refetch()}
          >
            Refresh
          </button>
        </div>
      </div>

      {isError && (
        <div className="card-body">
          <p style={{ color: "var(--ink-faint)", marginBottom: 12 }}>
            {(error as Error)?.message}
          </p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {!isError && (
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
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", color: "var(--ink-faint)" }}
                  >
                    Loading sessions…
                  </td>
                </tr>
              )}
              {!isLoading && data?.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      color: "var(--ink-faint)",
                      fontStyle: "italic",
                    }}
                  >
                    No sessions found
                  </td>
                </tr>
              )}
              {!isLoading &&
                data?.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="subj-title">{s.name}</div>
                    </td>
                    <td className="subj-sub">{s.academicYear?.name ?? "—"}</td>
                    <td className="subj-sub col-hide-sm">
                      {formatDate(s.startDate)}
                    </td>
                    <td className="subj-sub col-hide-sm">
                      {formatDate(s.endDate)}
                    </td>
                    <td>
                      <span
                        className={`status ${sessionStatusClass[s.status]}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          marginRight: 4,
                        }}
                        onClick={() => onView(s.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => onEdit(s.id)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
