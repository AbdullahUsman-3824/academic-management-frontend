import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AcademicSessionStatus } from "../../../api/academic";
import type { AcademicSession } from "../../../api/academic";
import {
  useSessions,
  useActivateSession,
  useCompleteSession,
  useYears,
} from "../../../hooks/useAcademicQueries";
import { StatusFilterBar } from "../../../components/StatusFilterBar";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { ProgressionModal } from "../../../components/ProgressionModal";
import { adminPaths } from "../../../data/navData";
import { formatDate, sessionStatusClass } from "../helpers";
import { SessionEdit } from "./SessionEdit";

const SESSION_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: AcademicSessionStatus.UPCOMING, label: "Upcoming" },
  { value: AcademicSessionStatus.ACTIVE, label: "Active" },
  { value: AcademicSessionStatus.COMPLETED, label: "Completed" },
  { value: AcademicSessionStatus.CANCELLED, label: "Cancelled" },
];

type ConfirmAction = "activate" | "complete";

interface ConfirmState {
  open: boolean;
  action: ConfirmAction | null;
  sessionId: string | null;
  sessionName: string;
}

const initialConfirmState: ConfirmState = {
  open: false,
  action: null,
  sessionId: null,
  sessionName: "",
};

const confirmCopy: Record<
  ConfirmAction,
  {
    title: string;
    message: (name: string) => string;
    confirmLabel: string;
  }
> = {
  activate: {
    title: "Activate Session",
    message: (name) => `Activate "${name}"?`,
    confirmLabel: "Activate",
  },
  complete: {
    title: "Complete Session",
    message: (name) => `Mark "${name}" as completed?`,
    confirmLabel: "Complete",
  },
};

export default function AcademicsSessionsPage() {
  const navigate = useNavigate();

  const [sessionStatus, setSessionStatus] = useState<
    AcademicSessionStatus | "all"
  >("all");
  const [sessionYearId, setSessionYearId] = useState<string | "all">("all");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [progressionSessionId, setProgressionSessionId] = useState<
    string | null
  >(null);
  const [confirmState, setConfirmState] =
    useState<ConfirmState>(initialConfirmState);

  const allYears = useYears("all");

  // Filtered list shown in the table
  const { data, isLoading, isError, error, refetch } = useSessions({
    status: sessionStatus === "all" ? undefined : sessionStatus,
    academicYearId: sessionYearId === "all" ? undefined : sessionYearId,
  });

  // Unfiltered list, used only to know which years already have an active session
  const allSessions = useSessions();

  const activate = useActivateSession();
  const complete = useCompleteSession();

  const activeYearIds = new Set(
    allSessions.data
      ?.filter((s) => s.status === AcademicSessionStatus.ACTIVE)
      .map((s) => s.academicYearId),
  );

  const sessions: AcademicSession[] = data ?? [];
  const years = allYears.data ?? [];

  const yearOptions = [
    { value: "all", label: "All years" },
    ...years.map((y) => ({ value: y.id, label: y.name })),
  ];

  const isMutating = activate.isPending || complete.isPending;
  const activeCopy = confirmState.action
    ? confirmCopy[confirmState.action]
    : null;

  const openConfirm = (action: ConfirmAction, session: AcademicSession) => {
    setConfirmState({
      open: true,
      action,
      sessionId: session.id,
      sessionName: session.name,
    });
  };

  const closeConfirm = () => setConfirmState(initialConfirmState);

  const handleConfirm = () => {
    const { action, sessionId } = confirmState;
    if (!action || !sessionId) return;

    // Close only on success so errors don't disappear silently
    if (action === "activate") {
      activate.mutate(sessionId, { onSuccess: closeConfirm });
    } else {
      complete.mutate(sessionId, { onSuccess: closeConfirm });
    }
  };

  return (
    <>
      {/* ── Filters ─────────────────────────────────────────── */}
      <StatusFilterBar
        filters={[
          {
            id: "status",
            label: "Status",
            value: sessionStatus,
            options: SESSION_STATUS_OPTIONS,
            onChange: (v) =>
              setSessionStatus(v as AcademicSessionStatus | "all"),
          },
          {
            id: "year",
            label: "Academic Year",
            value: sessionYearId,
            options: yearOptions,
            onChange: (v) => setSessionYearId(v),
          },
        ]}
        onRefresh={() => refetch()}
        meta={
          isLoading
            ? null
            : `${sessions.length} session${sessions.length !== 1 ? "s" : ""}${
                sessionStatus !== "all" ? ` · ${sessionStatus}` : ""
              }`
        }
      />

      {/* ── Error state ─────────────────────────────────────── */}
      {isError && (
        <div className="card-body">
          <p style={{ color: "crimson", marginBottom: 12 }}>
            {(error as Error)?.message ?? "Failed to load sessions"}
          </p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading state ───────────────────────────────────── */}
      {isLoading && <LoadingSpinner label="Loading sessions…" />}

      {/* ── Table ───────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th className="col-hide-sm">Start</th>
                <th className="col-hide-sm">End</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "32px 16px" }}
                  >
                    <p style={{ color: "var(--ink-faint)", marginBottom: 12 }}>
                      No sessions found
                    </p>
                    {years.length === 0 && (
                      <button
                        type="button"
                        className="btn"
                        onClick={() =>
                          navigate(`${adminPaths.academics}/setup`)
                        }
                      >
                        Setup Academic Year
                      </button>
                    )}
                  </td>
                </tr>
              )}

              {sessions.map((s) => {
                // Activate only when upcoming AND no active session in the same year
                const showActivate =
                  s.status === AcademicSessionStatus.UPCOMING &&
                  !activeYearIds.has(s.academicYearId);

                // Complete only when active
                const showComplete = s.status === AcademicSessionStatus.ACTIVE;

                // Progression only for active sessions that haven't run it yet
                const showProgress = showComplete && !s.progressed;

                return (
                  <tr key={s.id}>
                    <td>
                      <div className="subj-title">{s.name}</div>
                    </td>
                    <td className="subj-sub">{s.academicYear?.name ?? "—"}</td>
                    <td className="subj-sub col-hide-sm">
                      {formatDate(s.startDate)}
                    </td>
                    <td className="subj-sub col-hide-sm">
                      {formatDate(s.endDate)}
                    </td>
                    <td>
                      <span
                        className={`status ${sessionStatusClass[s.status] ?? ""}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          onClick={() => setEditingSessionId(s.id)}
                        >
                          Edit
                        </button>

                        {showActivate && (
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            disabled={isMutating}
                            onClick={() => openConfirm("activate", s)}
                          >
                            Activate
                          </button>
                        )}

                        {showComplete && (
                          <button
                            type="button"
                            className="btn secondary"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            disabled={isMutating}
                            onClick={() => openConfirm("complete", s)}
                          >
                            Complete
                          </button>
                        )}

                        {showProgress && (
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            onClick={() => setProgressionSessionId(s.id)}
                          >
                            Run Progression
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Edit overlay ────────────────────────────────────── */}
      {editingSessionId && (
        <SessionEdit
          id={editingSessionId}
          years={years}
          onClose={() => setEditingSessionId(null)}
        />
      )}

      {/* ── Progression modal ───────────────────────────────── */}
      {progressionSessionId && (
        <ProgressionModal
          academicSessionId={progressionSessionId}
          onClose={() => setProgressionSessionId(null)}
        />
      )}

      {/* ── Confirm modal ───────────────────────────────────── */}
      {confirmState.open && activeCopy && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={isMutating ? undefined : closeConfirm}
        >
          <div
            className="card"
            style={{ width: "min(440px, 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-head">
              <h2>{activeCopy.title}</h2>
            </div>

            <div className="card-body">
              <p
                style={{
                  margin: "0 0 18px",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--ink-soft)",
                }}
              >
                {activeCopy.message(confirmState.sessionName)}
              </p>

              {(activate.isError || complete.isError) && (
                <p style={{ color: "crimson", marginBottom: 12, fontSize: 13 }}>
                  {((activate.error ?? complete.error) as Error)?.message ??
                    "Something went wrong"}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  className="btn secondary"
                  onClick={closeConfirm}
                  disabled={isMutating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleConfirm}
                  disabled={isMutating}
                >
                  {isMutating ? "Working…" : activeCopy.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
