import { Link, useNavigate, useParams } from "react-router-dom";
import { useYear } from "../../../hooks/useAcademicQueries";
import { adminPaths } from "../../../data/navData";
import { formatDate } from "../../../helpers/academic.helpers";

export default function YearDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: year, isLoading, isError, error } = useYear(id ?? null);

  return (
    <div className="card" style={{ margin: 16 }}>
      <div className="card-head">
        <h2>Year Details</h2>
        <div className="inline-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate(adminPaths.academicsYears)}
          >
            ← Back to Years
          </button>
          {id && (
            <button
              type="button"
              className="btn"
              onClick={() => navigate(adminPaths.academicsYearEdit(id))}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        {isError ? (
          <p style={{ color: "crimson" }}>
            {(error as Error)?.message ?? "Failed to load year"}
          </p>
        ) : isLoading || !year ? (
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

            <div className="profile-field__label" style={{ marginTop: 12 }}>
              Sessions
            </div>
            {year.academicSessions && year.academicSessions.length > 0 ? (
              <div className="chip-list">
                {year.academicSessions.map((s) => (
                  <Link
                    key={s.id}
                    to={adminPaths.academicsSessionView(s.id)}
                    className="chip"
                    style={{ textDecoration: "none" }}
                  >
                    {s.name} ({s.status})
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>
                No sessions in this year yet.
              </p>
            )}

            <button
              type="button"
              className="btn secondary"
              style={{ marginTop: 12 }}
              onClick={() =>
                navigate(
                  `${adminPaths.academicsSessionNew}?yearId=${year.id}`,
                )
              }
            >
              + Add Session to this Year
            </button>
          </div>
        )}
      </div>
    </div>
  );
}