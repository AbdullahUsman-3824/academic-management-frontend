import { useNavigate, useParams } from "react-router-dom";
import {
  useActivateBatch,
  useBatch,
  useYears,
} from "../../../hooks/useAcademicQueries";
import { BatchStatus } from "../../../api/academic";
import { SectionManager } from "../../../components/SectionManager";
import { adminPaths } from "../../../data/navData";
import { formatDate } from "../../../helpers/academic.helpers";

export default function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: batch, isLoading, isError, error } = useBatch(id ?? null);
  const { data: years } = useYears("all");
  const activate = useActivateBatch();

  const entryYear = years?.find((y) => y.id === batch?.entryYearId);

  return (
    <div className="card" style={{ margin: 16 }}>
      <div className="card-head">
        <h2>Batch Details</h2>
        <div className="inline-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate(adminPaths.academicsBatches)}
          >
            ← Back to Batches
          </button>
          {id && (
            <button
              type="button"
              className="btn"
              onClick={() => navigate(adminPaths.academicsBatchEdit(id))}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        {isError ? (
          <p style={{ color: "crimson" }}>
            {(error as Error)?.message ?? "Failed to load batch"}
          </p>
        ) : isLoading || !batch ? (
          <p style={{ color: "var(--ink-faint)" }}>Loading…</p>
        ) : (
          <>
            <div className="profile-fields">
              {[
                { label: "Name", value: batch.name },
                { label: "Entry Year", value: entryYear?.name ?? "—" },
                {
                  label: "Program Duration",
                  value: batch.programDuration
                    ? `${batch.programDuration} year${batch.programDuration !== 1 ? "s" : ""}`
                    : "—",
                },
                { label: "Start", value: formatDate(batch.startDate) },
                {
                  label: "End",
                  value: batch.endDate ? formatDate(batch.endDate) : "Ongoing",
                },
                {
                  label: "Section Capacity",
                  value: String(batch.sectionCapacity ?? "—"),
                },
                {
                  label: "Students",
                  value: String(batch.counts?.students ?? 0),
                },
                {
                  label: "Sections",
                  value: String(batch.counts?.sections ?? 0),
                },
                { label: "Status", value: batch.status },
              ].map((f) => (
                <div className="profile-field" key={f.label}>
                  <div className="profile-field__label">{f.label}</div>
                  <div className="profile-field__value">{f.value}</div>
                </div>
              ))}
            </div>

            {batch.status === BatchStatus.INACTIVE && (
              <button
                type="button"
                className="btn"
                style={{ marginTop: 16 }}
                disabled={activate.isPending}
                onClick={() => activate.mutate(batch.id)}
              >
                {activate.isPending ? "Activating…" : "Activate Batch"}
              </button>
            )}

            <h3 style={{ margin: "24px 0 8px", fontSize: 15 }}>Sections</h3>
            <SectionManager batchId={batch.id} />
          </>
        )}
      </div>
    </div>
  );
}