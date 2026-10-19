import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BatchStatus } from "../../../api/academics";
import {
  useBatches,
  useActivateBatch,
} from "../../../hooks/useAcademicQueries";
import { StatusFilterBar } from "../../../components/StatusFilterBar";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { SectionManager } from "../../../components/SectionManager";
import { adminPaths } from "../../../data/navData";
import {
  formatDate,
  batchStatusClass,
} from "../../../helpers/academic.helpers";

const BATCH_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: BatchStatus.ACTIVE, label: "Active" },
  { value: BatchStatus.INACTIVE, label: "Inactive" },
  { value: BatchStatus.COMPLETED, label: "Completed" },
  { value: BatchStatus.CANCELLED, label: "Cancelled" },
];

export default function BatchesPage() {
  const navigate = useNavigate();
  const [batchStatus, setBatchStatus] = useState<BatchStatus | "all">("all");
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useBatches(batchStatus);
  const activate = useActivateBatch();
  const batches = data ?? [];

  return (
    <>
      <div
        className="card-head"
        style={{ borderTop: "none", borderBottom: "1px solid var(--line)" }}
      >
        <span className="meta">
          {isLoading
            ? "Loading…"
            : `${batches.length} batch${batches.length !== 1 ? "es" : ""}`}
        </span>
        <button
          type="button"
          className="btn"
          onClick={() => navigate(adminPaths.academicsBatchNew)}
        >
          + New Batch
        </button>
      </div>

      <StatusFilterBar
        filters={[
          {
            id: "status",
            label: "Status",
            value: batchStatus,
            options: BATCH_STATUS_OPTIONS,
            onChange: (v) => setBatchStatus(v as BatchStatus | "all"),
          },
        ]}
        onRefresh={() => refetch()}
      />

      {isError && (
        <div className="card-body">
          <p style={{ color: "crimson", marginBottom: 12 }}>
            {(error as Error)?.message ?? "Failed to load batches"}
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

      {isLoading && <LoadingSpinner label="Loading batches…" />}

      {!isLoading && !isError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th className="col-hide-sm">Start</th>
                <th className="col-hide-sm">End</th>
                <th>Students</th>
                <th>Sections</th>
                <th>Capacity</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
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

              {batches.map((batch) => (
                <Fragment key={batch.id}>
                  <tr>
                    <td>
                      <div className="subj-title">{batch.name}</div>
                    </td>
                    <td className="col-hide-sm subj-sub">
                      {formatDate(batch.startDate)}
                    </td>
                    <td className="col-hide-sm subj-sub">
                      {formatDate(batch.endDate)}
                    </td>
                    <td>{batch.counts?.students ?? 0}</td>
                    <td>{batch.counts?.sections ?? 0}</td>
                    <td className="subj-sub">{batch.sectionCapacity ?? "—"}</td>
                    <td>
                      <span
                        className={`status ${batchStatusClass[batch.status] ?? ""}`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          onClick={() =>
                            navigate(adminPaths.academicsBatchView(batch.id))
                          }
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          onClick={() =>
                            navigate(adminPaths.academicsBatchEdit(batch.id))
                          }
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          onClick={() =>
                            setExpandedBatchId(
                              expandedBatchId === batch.id ? null : batch.id,
                            )
                          }
                        >
                          {expandedBatchId === batch.id
                            ? "Hide Sections"
                            : "Manage Sections"}
                        </button>
                        {batch.status === BatchStatus.INACTIVE && (
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            disabled={activate.isPending}
                            onClick={() => activate.mutate(batch.id)}
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {expandedBatchId === batch.id && (
                    <tr>
                      <td
                        colSpan={8}
                        style={{ background: "var(--card)", padding: 0 }}
                      >
                        <SectionManager batchId={batch.id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}