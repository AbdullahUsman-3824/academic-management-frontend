import { useYear } from "../../../hooks/useAcademicQueries";
import { formatDate } from "../helpers";

export function YearDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { data: year, isLoading } = useYear(id);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>Year Details</h2>
        <button type="button" className="btn secondary" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="card-body">
        {isLoading || !year ? (
          <p style={{ color: "var(--ink-faint)" }}>Loading…</p>
        ) : (
          <div className="profile-fields">
            {[
              { label: "Name", value: year.name },
              { label: "Start", value: formatDate(year.startDate) },
              { label: "End", value: formatDate(year.endDate) },
              { label: "Status", value: year.status },
            ].map((f) => (
              <div className="profile-field" key={f.label}>
                <div className="profile-field__label">{f.label}</div>
                <div className="profile-field__value">{f.value}</div>
              </div>
            ))}
            {year.academicSessions && year.academicSessions.length > 0 && (
              <>
                <div className="profile-field__label" style={{ marginTop: 12 }}>
                  Sessions
                </div>
                <div className="chip-list">
                  {year.academicSessions.map((s) => (
                    <span key={s.id} className="chip">
                      {s.name} ({s.status})
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
