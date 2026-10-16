import { Link, useNavigate, useParams } from "react-router-dom";
import { useSession } from "../../../hooks/useAcademicQueries";
import { adminPaths } from "../../../data/navData";
import { formatDate } from "../../../helpers/academic.helpers";

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading, isError, error } = useSession(id ?? null);

  return (
    <div className="card" style={{ margin: 16 }}>
      <div className="card-head">
        <h2>Session Details</h2>
        <div className="inline-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate(adminPaths.academicsSessions)}
          >
            ← Back to Sessions
          </button>
          {id && (
            <button
              type="button"
              className="btn"
              onClick={() => navigate(adminPaths.academicsSessionEdit(id))}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        {isError ? (
          <p style={{ color: "crimson" }}>
            {(error as Error)?.message ?? "Failed to load session"}
          </p>
        ) : isLoading || !session ? (
          <p style={{ color: "var(--ink-faint)" }}>Loading…</p>
        ) : (
          <div className="profile-fields">
            <div className="profile-field">
              <div className="profile-field__label">Name</div>
              <div className="profile-field__value">{session.name}</div>
            </div>
            <div className="profile-field">
              <div className="profile-field__label">Academic Year</div>
              <div className="profile-field__value">
                {session.academicYear ? (
                  <Link
                    to={adminPaths.academicsYearView(session.academicYear.id)}
                  >
                    {session.academicYear.name}
                  </Link>
                ) : (
                  "—"
                )}
              </div>
            </div>
            {[
              { label: "Start", value: formatDate(session.startDate) },
              { label: "End", value: formatDate(session.endDate) },
              { label: "Status", value: session.status },
              {
                label: "Progression",
                value: session.progressed ? "Completed" : "Not run",
              },
            ].map((f) => (
              <div className="profile-field" key={f.label}>
                <div className="profile-field__label">{f.label}</div>
                <div className="profile-field__value">{f.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}