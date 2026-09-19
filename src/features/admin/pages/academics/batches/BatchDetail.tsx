import { useBatch, useActivateBatch } from "../../../hooks/useAcademicQueries";
import { formatDate } from "../helpers";
import { BatchStatus } from "../../../api/academic";

export function BatchDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { data: batch, isLoading } = useBatch(id);
  const activate = useActivateBatch();

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>Batch Details</h2>
        <button type="button" className="btn secondary" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="card-body">
        {isLoading || !batch ? (
          <p style={{ color: "var(--ink-faint)" }}>Loading…</p>
        ) : (
          <>
            <div className="profile-fields">
              {[
                { label: "Name", value: batch.name },
                { label: "Start", value: formatDate(batch.startDate) },
                {
                  label: "End",
                  value: batch.endDate ? formatDate(batch.endDate) : "Ongoing",
                },
                {
                  label: "Students",
                  value: String(batch._count?.students ?? 0),
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
                onClick={() =>
                  activate.mutate(batch.id, { onSuccess: onClose })
                }
              >
                Activate Batch
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
