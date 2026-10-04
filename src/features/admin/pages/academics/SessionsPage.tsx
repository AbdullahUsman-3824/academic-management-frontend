import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { StatusFilterBar } from '../../components/StatusFilterBar'
import {
  useAcademicSessions,
  useAcademicYears,
  useActivateSession,
  useCompleteSession,
} from '../../hooks/useAcademicQueries'
import type { AcademicSession } from '../../api/academic'
import { adminPaths } from '../../data/navData'
import { ProgressionModal } from '../../components/ProgressionModal'

const statusClass: Record<string, string> = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'ok',
  CANCELLED: 'closed',
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function SessionsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [progressionSessionId, setProgressionSessionId] = useState<string | null>(null)

  const yearsQuery = useAcademicYears()
  const sessionsQuery = useAcademicSessions({
    status: statusFilter === 'all' ? undefined : statusFilter,
    academicYearId: yearFilter === 'all' ? undefined : yearFilter,
  })

  const activateMutation = useActivateSession()
  const completeMutation = useCompleteSession()

  const sessions: AcademicSession[] = sessionsQuery.data ?? []
  const years = yearsQuery.data ?? []

  const handleActivate = (id: string) => {
    if (!window.confirm('Activate this session? Any other active session in the same year will be completed.')) {
      return
    }
    activateMutation.mutate(id)
  }

  const handleComplete = (id: string) => {
    if (!window.confirm('Mark this session as completed?')) {
      return
    }
    completeMutation.mutate(id)
  }

  return (
    <>
      <div
        className="card-head"
        style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
      >
        <span className="meta">
          {sessionsQuery.isLoading
            ? 'Loading…'
            : `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <StatusFilterBar
        filters={[
          {
            id: 'year',
            label: 'Year',
            value: yearFilter,
            options: [
              { value: 'all', label: 'All Years' },
              ...years.map((y) => ({ value: y.id, label: y.name })),
            ],
            onChange: setYearFilter,
          },
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
              { value: 'all', label: 'All' },
              { value: 'UPCOMING', label: 'Upcoming' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ],
            onChange: setStatusFilter,
          },
        ]}
        onRefresh={() => sessionsQuery.refetch()}
      />

      {sessionsQuery.isError && (
        <div className="card-body">
          <p style={{ color: 'crimson', marginBottom: 12 }}>
            {(sessionsQuery.error as Error)?.message ?? 'Failed to load sessions'}
          </p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => sessionsQuery.refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {sessionsQuery.isLoading && (
        <LoadingSpinner label="Loading academic sessions…" />
      )}

      {!sessionsQuery.isLoading && !sessionsQuery.isError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Session</th>
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
                    style={{
                      textAlign: 'center',
                      padding: '32px 16px',
                    }}
                  >
                    <p style={{ color: 'var(--ink-faint)', marginBottom: 12 }}>
                      No sessions found
                    </p>
                    {years.length === 0 && (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => navigate(`${adminPaths.academics}/setup`)}
                      >
                        Setup Academic Year
                      </button>
                    )}
                  </td>
                </tr>
              )}

              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <div className="subj-title">{session.name}</div>
                  </td>
                  <td className="subj-sub">
                    {session.academicYear?.name ?? '—'}
                  </td>
                  <td className="col-hide-sm subj-sub">
                    {formatDate(session.startDate)}
                  </td>
                  <td className="col-hide-sm subj-sub">
                    {formatDate(session.endDate)}
                  </td>
                  <td>
                    <span
                      className={`status ${statusClass[session.status] ?? ''}`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {session.status === 'UPCOMING' && (
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          disabled={activateMutation.isPending}
                          onClick={() => handleActivate(session.id)}
                        >
                          Activate
                        </button>
                      )}
                      {session.status === 'ACTIVE' && (
                        <>
                          <button
                            type="button"
                            className="btn secondary"
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            disabled={completeMutation.isPending}
                            onClick={() => handleComplete(session.id)}
                          >
                            Complete
                          </button>
                          {!session.progressed && (
                            <button
                              type="button"
                              className="btn"
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              onClick={() => setProgressionSessionId(session.id)}
                            >
                              Run Progression
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {progressionSessionId && (
        <ProgressionModal
          academicSessionId={progressionSessionId}
          onClose={() => setProgressionSessionId(null)}
        />
      )}
    </>
  )
}