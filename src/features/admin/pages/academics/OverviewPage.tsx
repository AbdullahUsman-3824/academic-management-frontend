import { useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import {
  useAcademicOverview,
  useProgressionCheck,
} from '../../hooks/useAcademicQueries'
import { adminPaths } from '../../data/navData'

export default function OverviewPage() {
  const navigate = useNavigate()
  const overview = useAcademicOverview()
  const progression = useProgressionCheck()

  if (overview.isLoading || progression.isLoading) {
    return <LoadingSpinner label="Loading academic overview…" />
  }

  if (overview.isError) {
    return (
      <div className="card-body">
        <p style={{ color: 'crimson' }}>
          Failed to load overview. Please try again.
        </p>
        <button
          type="button"
          className="btn secondary"
          onClick={() => overview.refetch()}
        >
          Retry
        </button>
      </div>
    )
  }

  const data = overview.data
  const prog = progression.data

  return (
    <div className="card-body">
      {/* Header with Setup button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 16 }}>Academic Overview</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--ink-faint)', fontSize: 13 }}>
            Current status and quick actions
          </p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => navigate(`${adminPaths.academics}/setup`)}
        >
          + Setup New Academic Year
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="stat-card">
          <div className="stat-label">Current Year</div>
          <div className="stat-value">
            {data?.currentYear?.name ?? '—'}
          </div>
          {data?.currentYear && (
            <div className="stat-sub">{data.currentYear.status}</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Session</div>
          <div className="stat-value">
            {data?.currentSession?.name ?? '—'}
          </div>
          {data?.currentSession && (
            <div className="stat-sub">{data.currentSession.status}</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-label">Academic Years</div>
          <div className="stat-value">
            {data?.statistics?.academicYears ?? 0}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Batches</div>
          <div className="stat-value">
            {data?.statistics?.activeBatches ?? 0}
          </div>
        </div>
      </div>

      {/* Progression status */}
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          border: '1px solid var(--line)',
          background: 'var(--surface-2, #f8f9fa)',
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Progression Status</h3>

        {!prog?.canStart && (
          <p style={{ margin: 0, color: 'var(--ink-faint)' }}>
            {prog?.reason ?? 'No active session available for progression.'}
          </p>
        )}

        {prog?.canStart && !prog.existingProgression && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ margin: 0 }}>
              Active session <strong>{prog.activeSession?.name}</strong> is ready
              for progression.
            </p>
            <button
              type="button"
              className="btn"
              onClick={() => navigate(`${adminPaths.academics}/progression`)}
            >
              Start Progression
            </button>
          </div>
        )}

        {prog?.existingProgression && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ margin: 0 }}>
              Progression in progress — status:{' '}
              <strong>{prog.existingProgression.status}</strong>
              {prog.existingProgression.currentStep && (
                <> (step: {prog.existingProgression.currentStep})</>
              )}
            </p>
            <button
              type="button"
              className="btn"
              onClick={() => navigate(`${adminPaths.academics}/progression`)}
            >
              Continue Progression
            </button>
          </div>
        )}
      </div>
    </div>
  )
}