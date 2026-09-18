import type { AcademicYearStatus } from "../../../api/academic";
import { useYears } from "../../../hooks/useAcademicQueries";
import { formatDate, yearStatusClass } from "../helpers";

export function YearsTab({
  yearStatus,
  setYearStatus,
  yearsQuery,
  onView,
  onEdit,
}: {
  yearStatus: AcademicYearStatus | "all";
  setYearStatus: (s: AcademicYearStatus | "all") => void;
  yearsQuery: ReturnType<typeof useYears>;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const { data, isLoading, isError, error, refetch } = yearsQuery;
  const statuses: (AcademicYearStatus | "all")[] = [
    "all",
    "active",
    "inactive",
    "completed",
  ];

  return (
    <>
      <div className="tabs-row" style={{ borderTop: "1px solid var(--line)" }}>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            className={`tab-btn${yearStatus === s ? " active" : ""}`}
            onClick={() => setYearStatus(s)}
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
            : `${data?.length ?? 0} year${(data?.length ?? 0) !== 1 ? "s" : ""}`}
          {yearStatus !== "all" ? ` · ${yearStatus}` : ""}
        </span>
        <button
          type="button"
          className="btn secondary"
          onClick={() => refetch()}
        >
          Refresh
        </button>
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
                <th className="col-hide-sm">Start Date</th>
                <th className="col-hide-sm">End Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", color: "var(--ink-faint)" }}
                  >
                    Loading years…
                  </td>
                </tr>
              )}
              {!isLoading && data?.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      color: "var(--ink-faint)",
                      fontStyle: "italic",
                    }}
                  >
                    No academic years found
                  </td>
                </tr>
              )}
              {!isLoading &&
                data?.map((year) => (
                  <tr key={year.id}>
                    <td>
                      <div className="subj-title">{year.name}</div>
                    </td>
                    <td className="subj-sub col-hide-sm">
                      {formatDate(year.startDate)}
                    </td>
                    <td className="subj-sub col-hide-sm">
                      {formatDate(year.endDate)}
                    </td>
                    <td>
                      <span
                        className={`status ${yearStatusClass[year.status]}`}
                      >
                        {year.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          marginRight: 6,
                        }}
                        onClick={() => onView(year.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => onEdit(year.id)}
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
