import { useState, useEffect } from "react";
import { useYear, useUpdateYear } from "../../../hooks/useAcademicQueries";
import { toInputDate, inputStyle } from "../helpers";

export function YearEdit({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: year, isLoading } = useYear(id);
  const update = useUpdateYear();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (year) {
      setName(year.name);
      setStartDate(toInputDate(year.startDate));
      setEndDate(toInputDate(year.endDate));
    }
  }, [year]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      { id, dto: { name, startDate, endDate } },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>Edit Year</h2>
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
                <div className="profile-field__label">End Date</div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={inputStyle}
                />
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
