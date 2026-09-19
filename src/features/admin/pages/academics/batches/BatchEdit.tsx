import { useState, useEffect } from "react";
import { BatchStatus } from "../../../api/academic";
import { useBatch, useUpdateBatch } from "../../../hooks/useAcademicQueries";
import { toInputDate, inputStyle } from "../helpers";

export function BatchEdit({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { data: batch, isLoading } = useBatch(id);
  const update = useUpdateBatch();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<BatchStatus>(BatchStatus.ACTIVE);

  useEffect(() => {
    if (batch) {
      setName(batch.name);
      setStartDate(toInputDate(batch.startDate));
      setEndDate(toInputDate(batch.endDate));
      setStatus(batch.status);
    }
  }, [batch]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      {
        id,
        dto: {
          name,
          startDate,
          endDate: endDate || null,
          status,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>Edit Batch</h2>
        <button type="button" className="btn secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
      <div className="card-body">
        {isLoading ? (
          <p style={{ color: "var(--ink-faint)" }}>Loading…</p>
        ) : (
          <form onSubmit={submit}>
            {update.isError && (
              <p style={{ color: "crimson", marginBottom: 12 }}>
                {(update.error as Error)?.message}
              </p>
            )}
            <div className="profile-fields">
              <div className="profile-field">
                <div className="profile-field__label">Name</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">Start Date</div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">End Date (optional)</div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">Status</div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BatchStatus)}
                  style={inputStyle}
                >
                  <option value={BatchStatus.ACTIVE}>Active</option>
                  <option value={BatchStatus.INACTIVE}>Inactive</option>
                  <option value={BatchStatus.COMPLETED}>Completed</option>
                  <option value={BatchStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="btn"
              style={{ marginTop: 16 }}
              disabled={update.isPending}
            >
              {update.isPending ? "Saving…" : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
