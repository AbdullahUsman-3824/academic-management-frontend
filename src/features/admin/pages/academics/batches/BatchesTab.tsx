import type { BatchStatus } from "../../../api/academic";
import {
  useBatches,
  useActivateBatch,
} from "../../../hooks/useAcademicQueries";
import { formatDate, batchStatusClass } from "../helpers";

export function BatchesTab({
  batchStatus,
  setBatchStatus,
  batchesQuery,
  onView,
  onEdit,
}: {
  batchStatus: BatchStatus | "all";
  setBatchStatus: (s: BatchStatus | "all") => void;
  batchesQuery: ReturnType<typeof useBatches>;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const { data, isLoading, isError, error, refetch } = batchesQuery;
  const activate = useActivateBatch();
  const statuses: (BatchStatus | "all")[] = [
    "all",
    "active",
    "inactive",
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
            className={`tab-btn${batchStatus === s ? " active" : ""}`}
            onClick={() => setBatchStatus(s)}
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
            : `${data?.length ?? 0} batch${(data?.length ?? 0) !== 1 ? "es" : ""}`}
          {batchStatus !== "all" ? ` · ${batchStatus}` : ""}
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
                <th className="col-hide-sm">Start</th>
                <th className="col-hide-sm">End</th>
                <th>Students</th>
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
                    Loading batches…
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
                    No batches found
                  </td>
                </tr>
              )}
              {!isLoading &&
                data?.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="subj-title">{b.name}</div>
                    </td>
                    <td className="subj-sub col-hide-sm">
                      {formatDate(b.startDate)}
                    </td>
                    <td className="subj-sub col-hide-sm">
                      {formatDate(b.endDate)}
                    </td>
                    <td>{b._count?.students ?? 0}</td>
                    <td>
                      <span className={`status ${batchStatusClass[b.status]}`}>
                        {b.status}
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
                        onClick={() => onView(b.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          marginRight: 4,
                        }}
                        onClick={() => onEdit(b.id)}
                      >
                        Edit
                      </button>
                      {b.status === "inactive" && (
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          disabled={activate.isPending}
                          onClick={() => activate.mutate(b.id)}
                        >
                          Activate
                        </button>
                      )}
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
