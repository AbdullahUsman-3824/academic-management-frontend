import { useOverview } from "../../hooks/useAcademicQueries";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { formatDate } from "./helpers";

export default function AcademicsOverviewPage() {
  const { data, isLoading, isError, error, refetch } = useOverview();

  if (isLoading) {
    return <LoadingSpinner label="Fetching overview…" />;
  }

  if (isError) {
    return (
      <div className="card-body">
        <p style={{ color: "var(--ink-faint)", marginBottom: 12 }}>
          {(error as Error)?.message}
        </p>
        <button type="button" className="btn secondary" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const { currentYear, currentSession, statistics } = data!;

  return (
    <div className="overview-grid">
      {/* Current Year */}
      <div className="overview-card">
        <div className="card-head">
          <h2>Current Year</h2>
        </div>
        <div className="card-body">
          {currentYear ? (
            <>
              <div className="subj-title">{currentYear.name}</div>
              <div className="subj-sub" style={{ marginTop: 4 }}>
                {formatDate(currentYear.startDate)} – {formatDate(currentYear.endDate)}
              </div>
              <div style={{ marginTop: 8 }}>
                <span
                  className={`status ${currentYear.status === "active" ? "active" : "inactive"}`}
                >
                  {currentYear.status}
                </span>
              </div>
            </>
          ) : (
            <p style={{ color: "var(--ink-faint)", fontStyle: "italic", margin: 0 }}>
              No active academic year
            </p>
          )}
        </div>
      </div>

      {/* Current Session */}
      <div className="overview-card">
        <div className="card-head">
          <h2>Current Session</h2>
        </div>
        <div className="card-body">
          {currentSession ? (
            <>
              <div className="subj-title">{currentSession.name}</div>
              <div className="subj-sub" style={{ marginTop: 4 }}>
                {formatDate(currentSession.startDate)} – {formatDate(currentSession.endDate)}
              </div>
              <div style={{ marginTop: 8 }}>
                <span
                  className={`status ${currentSession.status === "active" ? "active" : "inactive"}`}
                >
                  {currentSession.status}
                </span>
              </div>
            </>
          ) : (
            <p style={{ color: "var(--ink-faint)", fontStyle: "italic", margin: 0 }}>
              No active session
            </p>
          )}
        </div>
      </div>

      {/* Total Years */}
      <div className="overview-card">
        <div className="card-head">
          <h2>Total Years</h2>
        </div>
        <div className="card-body">
          <div className="subj-title" style={{ fontSize: 28 }}>
            {statistics.academicYears}
          </div>
        </div>
      </div>

      {/* Active Batches */}
      <div className="overview-card">
        <div className="card-head">
          <h2>Active Batches</h2>
        </div>
        <div className="card-body">
          <div className="subj-title" style={{ fontSize: 28 }}>
            {statistics.activeBatches}
          </div>
        </div>
      </div>
    </div>
  );
}
