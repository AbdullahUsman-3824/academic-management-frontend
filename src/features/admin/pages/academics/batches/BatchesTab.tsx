import { useState } from "react";
import { BatchStatus } from "../../../api/academic";
import {
  useBatches,
  useActivateBatch,
} from "../../../hooks/useAcademicQueries";
import { StatusFilterBar } from "../../../components/StatusFilterBar";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { formatDate, batchStatusClass } from "../helpers";
import { BatchDetail } from "./BatchDetail";
import { BatchEdit } from "./BatchEdit";

const BATCH_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: BatchStatus.ACTIVE, label: "Active" },
  { value: BatchStatus.INACTIVE, label: "Inactive" },
  { value: BatchStatus.COMPLETED, label: "Completed" },
  { value: BatchStatus.CANCELLED, label: "Cancelled" },
];

export default function AcademicsBatchesPage() {
  const [batchStatus, setBatchStatus] = useState<BatchStatus | "all">("all");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useBatches(batchStatus);
  const activate = useActivateBatch();

  return (
    <>
      {/* ── Filters ─────────────────────────────────────────── */}
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
        meta={
          isLoading
            ? null
            : `${data?.length ?? 0} batch${(data?.length ?? 0) !== 1 ? "es" : ""}${batchStatus !== "all" ? ` · ${batchStatus}` : ""}`
        }
      />

      {/* ── Error state ─────────────────────────────────────── */}
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

      {/* ── Loading state ───────────────────────────────────── */}
      {isLoading && <LoadingSpinner label="Loading batches…" />}

      {/* ── Table ───────────────────────────────────────────── */}
      {!isLoading && !isError && (
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
              {data?.length === 0 && (
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
              {data?.map((b) => (
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
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => setSelectedBatchId(b.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => setEditingBatchId(b.id)}
                      >
                        Edit
                      </button>
                      {b.status === BatchStatus.INACTIVE && (
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail / Edit overlays ──────────────────────────── */}
      {selectedBatchId && (
        <BatchDetail
          id={selectedBatchId}
          onClose={() => setSelectedBatchId(null)}
        />
      )}
      {editingBatchId && (
        <BatchEdit
          id={editingBatchId}
          onClose={() => setEditingBatchId(null)}
        />
      )}
    </>
  );
}
