import {
  useSession,
  useActivateSession,
  useCompleteSession,
} from "../../../hooks/useAcademicQueries";
import { formatDate } from "../helpers";
import { AcademicSessionStatus } from "../../../api/academic";

export function SessionDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { data: session, isLoading } = useSession(id);
  const activate = useActivateSession();
  const complete = useCompleteSession();

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>Session Details</h2>
        <button type="button" className="btn secondary" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="card-body">
        {isLoading || !session ? (
          <p style={{ color: "var(--ink-faint)" }}>Loading…</p>
        ) : (
          <>
            <div className="profile-fields">
              {[
                { label: "Name", value: session.name },
                { label: "Year", value: session.academicYear?.name ?? "—" },
                { label: "Start", value: formatDate(session.startDate) },
                { label: "End", value: formatDate(session.endDate) },
                { label: "Status", value: session.status },
              ].map((f) => (
                <div className="profile-field" key={f.label}>
                  <div className="profile-field__label">{f.label}</div>
                  <div className="profile-field__value">{f.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              {session.status === AcademicSessionStatus.UPCOMING && (
                <button
                  type="button"
                  className="btn"
                  disabled={activate.isPending}
                  onClick={() =>
                    activate.mutate(session.id, { onSuccess: onClose })
                  }
                >
                  Activate
                </button>
              )}
              {session.status === AcademicSessionStatus.ACTIVE && (
                <button
                  type="button"
                  className="btn"
                  disabled={complete.isPending}
                  onClick={() =>
                    complete.mutate(session.id, { onSuccess: onClose })
                  }
                >
                  Complete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
