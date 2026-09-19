import { useState, useEffect } from "react";
import { AcademicSessionStatus } from "../../../api/academic";
import {
  useSession,
  useUpdateSession,
} from "../../../hooks/useAcademicQueries";
import { toInputDate, inputStyle } from "../helpers";

export function SessionEdit({
  id,
  years,
  onClose,
}: {
  id: string;
  years: { id: string; name: string }[];
  onClose: () => void;
}) {
  const { data: session, isLoading } = useSession(id);
  const update = useUpdateSession();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<AcademicSessionStatus>(
    AcademicSessionStatus.UPCOMING,
  );
  const [academicYearId, setAcademicYearId] = useState("");

  useEffect(() => {
    if (session) {
      setName(session.name);
      setStartDate(toInputDate(session.startDate));
      setEndDate(toInputDate(session.endDate));
      setStatus(session.status);
      setAcademicYearId(session.academicYearId);
    }
  }, [session]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      { id, dto: { name, startDate, endDate, status, academicYearId } },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>Edit Session</h2>
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
                <div className="profile-field__label">Academic Year</div>
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  required
                  style={inputStyle}
                >
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
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
              <div className="profile-field">
                <div className="profile-field__label">Status</div>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as AcademicSessionStatus)
                  }
                  style={inputStyle}
                >
                  <option value={AcademicSessionStatus.UPCOMING}>
                    Upcoming
                  </option>
                  <option value={AcademicSessionStatus.ACTIVE}>Active</option>
                  <option value={AcademicSessionStatus.COMPLETED}>
                    Completed
                  </option>
                  <option value={AcademicSessionStatus.CANCELLED}>
                    Cancelled
                  </option>
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
