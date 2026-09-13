import { useState, useEffect } from 'react'
import {
  useOverview,
  useYears,
  useYear,
  useUpdateYear,
  useSessions,
  useSession,
  useUpdateSession,
  useActivateSession,
  useCompleteSession,
  useBatches,
  useBatch,
  useUpdateBatch,
  useActivateBatch,
  useSetupAcademic,
} from '../../../hooks/useAcademicQueries'
import type {
  AcademicYearStatus,
  AcademicSessionStatus,
  BatchStatus,
  AcademicSetupPayload,
} from '../../../api/academic'

// ── Helpers ─────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'years' | 'sessions' | 'batches' | 'setup'

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

function toInputDate(value?: string | null) {
  if (!value) return ''
  try {
    return new Date(value).toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

function isValidRange(start: string, end: string) {
  return !!start && !!end && new Date(end) > new Date(start)
}

const yearStatusClass: Record<AcademicYearStatus, string> = {
  active: 'active',
  inactive: 'inactive',
  completed: 'ok',
}

const sessionStatusClass: Record<AcademicSessionStatus, string> = {
  upcoming: 'upcoming',
  active: 'active',
  completed: 'ok',
  cancelled: 'inactive',
}

const batchStatusClass: Record<BatchStatus, string> = {
  active: 'active',
  inactive: 'inactive',
  completed: 'ok',
  cancelled: 'inactive',
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [yearStatus, setYearStatus] = useState<AcademicYearStatus | 'all'>('all')
  const [sessionStatus, setSessionStatus] =
    useState<AcademicSessionStatus | 'all'>('all')
  const [sessionYearId, setSessionYearId] = useState<string | 'all'>('all')
  const [batchStatus, setBatchStatus] = useState<BatchStatus | 'all'>('all')

  // detail / edit selection
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null)
  const [editingYearId, setEditingYearId] = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null)

  const overview = useOverview()
  const yearsQuery = useYears(yearStatus)
  const allYears = useYears('all')
  const sessionsQuery = useSessions({
    status: sessionStatus,
    academicYearId: sessionYearId,
  })
  const batchesQuery = useBatches(batchStatus)

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Academics</h1>
          <div className="today">
            Academic years, sessions, batches, and setup.
          </div>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => setActiveTab('setup')}
        >
          + New Setup
        </button>
      </div>

      <div className="card">
        <div className="tabs-row">
          {(
            [
              ['overview', 'Overview'],
              ['years', 'Years'],
              ['sessions', 'Sessions'],
              ['batches', 'Batches'],
              ['setup', 'Setup'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`tab-btn${activeTab === key ? ' active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab overview={overview} />}

        {activeTab === 'years' && (
          <YearsTab
            yearStatus={yearStatus}
            setYearStatus={setYearStatus}
            yearsQuery={yearsQuery}
            onView={(id) => setSelectedYearId(id)}
            onEdit={(id) => setEditingYearId(id)}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsTab
            sessionStatus={sessionStatus}
            setSessionStatus={setSessionStatus}
            sessionYearId={sessionYearId}
            setSessionYearId={setSessionYearId}
            years={allYears.data ?? []}
            sessionsQuery={sessionsQuery}
            onView={(id) => setSelectedSessionId(id)}
            onEdit={(id) => setEditingSessionId(id)}
          />
        )}

        {activeTab === 'batches' && (
          <BatchesTab
            batchStatus={batchStatus}
            setBatchStatus={setBatchStatus}
            batchesQuery={batchesQuery}
            onView={(id) => setSelectedBatchId(id)}
            onEdit={(id) => setEditingBatchId(id)}
          />
        )}

        {activeTab === 'setup' && (
          <SetupTab onDone={() => setActiveTab('overview')} />
        )}
      </div>

      {/* Detail / Edit overlays */}
      {selectedYearId && (
        <YearDetail
          id={selectedYearId}
          onClose={() => setSelectedYearId(null)}
        />
      )}
      {editingYearId && (
        <YearEdit
          id={editingYearId}
          onClose={() => setEditingYearId(null)}
        />
      )}
      {selectedSessionId && (
        <SessionDetail
          id={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
        />
      )}
      {editingSessionId && (
        <SessionEdit
          id={editingSessionId}
          years={allYears.data ?? []}
          onClose={() => setEditingSessionId(null)}
        />
      )}
      {selectedBatchId && (
        <BatchDetail
          id={selectedBatchId}
          onClose={() => setSelectedBatchId(null)}
        />
      )}
      {editingBatchId && (
        <BatchEdit
          id={editingBatchId}
          onClose={() => setEditingBatchId(null)}
        />
      )}
    </>
  )
}

// ── Overview ────────────────────────────────────────────────────────────────

function OverviewTab({
  overview,
}: {
  overview: ReturnType<typeof useOverview>
}) {
  const { data, isLoading, isError, error, refetch } = overview

  if (isLoading) {
    return (
      <div className="card-body">
        <p style={{ color: 'var(--ink-faint)', margin: 0 }}>Fetching overview…</p>
      </div>
    )
  }
  if (isError) {
    return (
      <div className="card-body">
        <p style={{ color: 'var(--ink-faint)', marginBottom: 12 }}>
          {(error as Error)?.message}
        </p>
        <button type="button" className="btn secondary" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    )
  }

  const { currentYear, currentSession, statistics } = data!

  return (
    <div className="profile-grid" style={{ padding: 16 }}>
      <div className="card">
        <div className="card-head"><h2>Current Year</h2></div>
        <div className="card-body">
          {currentYear ? (
            <>
              <div className="subj-title">{currentYear.name}</div>
              <div className="subj-sub" style={{ marginTop: 4 }}>
                {formatDate(currentYear.startDate)} – {formatDate(currentYear.endDate)}
              </div>
              <div style={{ marginTop: 8 }}>
                <span className={`status ${currentYear.status === 'active' ? 'active' : 'inactive'}`}>
                  {currentYear.status}
                </span>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--ink-faint)', fontStyle: 'italic', margin: 0 }}>
              No active academic year
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Current Session</h2></div>
        <div className="card-body">
          {currentSession ? (
            <>
              <div className="subj-title">{currentSession.name}</div>
              <div className="subj-sub" style={{ marginTop: 4 }}>
                {formatDate(currentSession.startDate)} – {formatDate(currentSession.endDate)}
              </div>
              <div style={{ marginTop: 8 }}>
                <span className={`status ${currentSession.status === 'active' ? 'active' : 'inactive'}`}>
                  {currentSession.status}
                </span>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--ink-faint)', fontStyle: 'italic', margin: 0 }}>
              No active session
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Total Years</h2></div>
        <div className="card-body">
          <div className="subj-title" style={{ fontSize: 28 }}>
            {statistics.academicYears}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Active Batches</h2></div>
        <div className="card-body">
          <div className="subj-title" style={{ fontSize: 28 }}>
            {statistics.activeBatches}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Years ───────────────────────────────────────────────────────────────────

function YearsTab({
  yearStatus,
  setYearStatus,
  yearsQuery,
  onView,
  onEdit,
}: {
  yearStatus: AcademicYearStatus | 'all'
  setYearStatus: (s: AcademicYearStatus | 'all') => void
  yearsQuery: ReturnType<typeof useYears>
  onView: (id: string) => void
  onEdit: (id: string) => void
}) {
  const { data, isLoading, isError, error, refetch } = yearsQuery
  const statuses: (AcademicYearStatus | 'all')[] = [
    'all',
    'active',
    'inactive',
    'completed',
  ]

  return (
    <>
      <div className="tabs-row" style={{ borderTop: '1px solid var(--line)' }}>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            className={`tab-btn${yearStatus === s ? ' active' : ''}`}
            onClick={() => setYearStatus(s)}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div
        className="card-head"
        style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
      >
        <span className="meta">
          {isLoading ? 'Loading…' : `${data?.length ?? 0} year${(data?.length ?? 0) !== 1 ? 's' : ''}`}
          {yearStatus !== 'all' ? ` · ${yearStatus}` : ''}
        </span>
        <button type="button" className="btn secondary" onClick={() => refetch()}>
          Refresh
        </button>
      </div>

      {isError && (
        <div className="card-body">
          <p style={{ color: 'var(--ink-faint)', marginBottom: 12 }}>
            {(error as Error)?.message}
          </p>
          <button type="button" className="btn secondary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {!isError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th className="col-hide-sm">Start Date</th>
                <th className="col-hide-sm">End Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
                    Loading years…
                  </td>
                </tr>
              )}
              {!isLoading && data?.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                    No academic years found
                  </td>
                </tr>
              )}
              {!isLoading &&
                data?.map((year) => (
                  <tr key={year.id}>
                    <td><div className="subj-title">{year.name}</div></td>
                    <td className="subj-sub col-hide-sm">{formatDate(year.startDate)}</td>
                    <td className="subj-sub col-hide-sm">{formatDate(year.endDate)}</td>
                    <td>
                      <span className={`status ${yearStatusClass[year.status]}`}>
                        {year.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: '4px 10px', fontSize: 12, marginRight: 6 }}
                        onClick={() => onView(year.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => onEdit(year.id)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function YearDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: year, isLoading } = useYear(id)

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
          <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
        ) : (
          <div className="profile-fields">
            {[
              { label: 'Name', value: year.name },
              { label: 'Start', value: formatDate(year.startDate) },
              { label: 'End', value: formatDate(year.endDate) },
              { label: 'Status', value: year.status },
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
  )
}

function YearEdit({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: year, isLoading } = useYear(id)
  const update = useUpdateYear()
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (year) {
      setName(year.name)
      setStartDate(toInputDate(year.startDate))
      setEndDate(toInputDate(year.endDate))
    }
  }, [year])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    update.mutate(
      { id, dto: { name, startDate, endDate } },
      { onSuccess: onClose },
    )
  }

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
          <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
        ) : (
          <form onSubmit={submit}>
            {update.isError && (
              <p style={{ color: 'crimson', marginBottom: 12 }}>
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
              {update.isPending ? 'Saving…' : 'Save'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 5,
  border: '1px solid var(--line)',
  fontSize: 13,
  width: '100%',
  maxWidth: 320,
}

// ── Sessions ────────────────────────────────────────────────────────────────

function SessionsTab({
  sessionStatus,
  setSessionStatus,
  sessionYearId,
  setSessionYearId,
  years,
  sessionsQuery,
  onView,
  onEdit,
}: {
  sessionStatus: AcademicSessionStatus | 'all'
  setSessionStatus: (s: AcademicSessionStatus | 'all') => void
  sessionYearId: string | 'all'
  setSessionYearId: (id: string | 'all') => void
  years: { id: string; name: string }[]
  sessionsQuery: ReturnType<typeof useSessions>
  onView: (id: string) => void
  onEdit: (id: string) => void
}) {
  const { data, isLoading, isError, error, refetch } = sessionsQuery
  const activate = useActivateSession()
  const complete = useCompleteSession()

  const statuses: (AcademicSessionStatus | 'all')[] = [
    'all',
    'upcoming',
    'active',
    'completed',
    'cancelled',
  ]

  return (
    <>
      <div className="tabs-row" style={{ borderTop: '1px solid var(--line)' }}>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            className={`tab-btn${sessionStatus === s ? ' active' : ''}`}
            onClick={() => setSessionStatus(s)}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div
        className="card-head"
        style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
      >
        <span className="meta">
          {isLoading ? 'Loading…' : `${data?.length ?? 0} session${(data?.length ?? 0) !== 1 ? 's' : ''}`}
          {sessionStatus !== 'all' ? ` · ${sessionStatus}` : ''}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={sessionYearId}
            onChange={(e) => setSessionYearId(e.target.value as string | 'all')}
            style={inputStyle}
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn secondary" onClick={() => refetch()}>
            Refresh
          </button>
        </div>
      </div>

      {isError && (
        <div className="card-body">
          <p style={{ color: 'var(--ink-faint)', marginBottom: 12 }}>
            {(error as Error)?.message}
          </p>
          <button type="button" className="btn secondary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {!isError && (
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
              {isLoading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
                    Loading sessions…
                  </td>
                </tr>
              )}
              {!isLoading && data?.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                    No sessions found
                  </td>
                </tr>
              )}
              {!isLoading &&
                data?.map((s) => (
                  <tr key={s.id}>
                    <td><div className="subj-title">{s.name}</div></td>
                    <td className="subj-sub">{s.academicYear?.name ?? '—'}</td>
                    <td className="subj-sub col-hide-sm">{formatDate(s.startDate)}</td>
                    <td className="subj-sub col-hide-sm">{formatDate(s.endDate)}</td>
                    <td>
                      <span className={`status ${sessionStatusClass[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                   <td>
  <button
    type="button"
    className="btn secondary"
    style={{ padding: '4px 10px', fontSize: 12, marginRight: 4 }}
    onClick={() => onView(s.id)}
  >
    View
  </button>
  <button
    type="button"
    className="btn secondary"
    style={{ padding: '4px 10px', fontSize: 12 }}
    onClick={() => onEdit(s.id)}
  >
    Edit
  </button>
</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function SessionDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: session, isLoading } = useSession(id)
  const activate = useActivateSession()
  const complete = useCompleteSession()

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
          <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
        ) : (
          <>
            <div className="profile-fields">
              {[
                { label: 'Name', value: session.name },
                { label: 'Year', value: session.academicYear?.name ?? '—' },
                { label: 'Start', value: formatDate(session.startDate) },
                { label: 'End', value: formatDate(session.endDate) },
                { label: 'Status', value: session.status },
              ].map((f) => (
                <div className="profile-field" key={f.label}>
                  <div className="profile-field__label">{f.label}</div>
                  <div className="profile-field__value">{f.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              {session.status === 'upcoming' && (
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
              {session.status === 'active' && (
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
  )
}

function SessionEdit({
  id,
  years,
  onClose,
}: {
  id: string
  years: { id: string; name: string }[]
  onClose: () => void
}) {
  const { data: session, isLoading } = useSession(id)
  const update = useUpdateSession()
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<AcademicSessionStatus>('upcoming')
  const [academicYearId, setAcademicYearId] = useState('')

  useEffect(() => {
    if (session) {
      setName(session.name)
      setStartDate(toInputDate(session.startDate))
      setEndDate(toInputDate(session.endDate))
      setStatus(session.status)
      setAcademicYearId(session.academicYearId)
    }
  }, [session])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    update.mutate(
      { id, dto: { name, startDate, endDate, status, academicYearId } },
      { onSuccess: onClose },
    )
  }

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
          <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
        ) : (
          <form onSubmit={submit}>
            {update.isError && (
              <p style={{ color: 'crimson', marginBottom: 12 }}>
                {(update.error as Error)?.message}
              </p>
            )}
            <div className="profile-fields">
              <div className="profile-field">
                <div className="profile-field__label">Name</div>
                <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
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
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>
              <div className="profile-field">
                <div className="profile-field__label">Start Date</div>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={inputStyle} />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">End Date</div>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={inputStyle} />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">Status</div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AcademicSessionStatus)}
                  style={inputStyle}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn" style={{ marginTop: 16 }} disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Batches ─────────────────────────────────────────────────────────────────

function BatchesTab({
  batchStatus,
  setBatchStatus,
  batchesQuery,
  onView,
  onEdit,
}: {
  batchStatus: BatchStatus | 'all'
  setBatchStatus: (s: BatchStatus | 'all') => void
  batchesQuery: ReturnType<typeof useBatches>
  onView: (id: string) => void
  onEdit: (id: string) => void
}) {
  const { data, isLoading, isError, error, refetch } = batchesQuery
  const activate = useActivateBatch()
  const statuses: (BatchStatus | 'all')[] = [
    'all',
    'active',
    'inactive',
    'completed',
    'cancelled',
  ]

  return (
    <>
      <div className="tabs-row" style={{ borderTop: '1px solid var(--line)' }}>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            className={`tab-btn${batchStatus === s ? ' active' : ''}`}
            onClick={() => setBatchStatus(s)}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div
        className="card-head"
        style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
      >
        <span className="meta">
          {isLoading ? 'Loading…' : `${data?.length ?? 0} batch${(data?.length ?? 0) !== 1 ? 'es' : ''}`}
          {batchStatus !== 'all' ? ` · ${batchStatus}` : ''}
        </span>
        <button type="button" className="btn secondary" onClick={() => refetch()}>
          Refresh
        </button>
      </div>

      {isError && (
        <div className="card-body">
          <p style={{ color: 'var(--ink-faint)', marginBottom: 12 }}>
            {(error as Error)?.message}
          </p>
          <button type="button" className="btn secondary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {!isError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th className="col-hide-sm">Start</th>
                <th className="col-hide-sm">End</th>
                <th>Students</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
                    Loading batches…
                  </td>
                </tr>
              )}
              {!isLoading && data?.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                    No batches found
                  </td>
                </tr>
              )}
              {!isLoading &&
                data?.map((b) => (
                  <tr key={b.id}>
                    <td><div className="subj-title">{b.name}</div></td>
                    <td className="subj-sub col-hide-sm">{formatDate(b.startDate)}</td>
                    <td className="subj-sub col-hide-sm">{formatDate(b.endDate)}</td>
                    <td>{b._count?.students ?? 0}</td>
                    <td>
                      <span className={`status ${batchStatusClass[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: '4px 10px', fontSize: 12, marginRight: 4 }}
                        onClick={() => onView(b.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: '4px 10px', fontSize: 12, marginRight: 4 }}
                        onClick={() => onEdit(b.id)}
                      >
                        Edit
                      </button>
                      {b.status === 'inactive' && (
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          disabled={activate.isPending}
                          onClick={() => activate.mutate(b.id)}
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function BatchDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: batch, isLoading } = useBatch(id)
  const activate = useActivateBatch()

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>Batch Details</h2>
        <button type="button" className="btn secondary" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="card-body">
        {isLoading || !batch ? (
          <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
        ) : (
          <>
            <div className="profile-fields">
              {[
                { label: 'Name', value: batch.name },
                { label: 'Start', value: formatDate(batch.startDate) },
                {
                  label: 'End',
                  value: batch.endDate ? formatDate(batch.endDate) : 'Ongoing',
                },
                { label: 'Students', value: String(batch._count?.students ?? 0) },
                { label: 'Status', value: batch.status },
              ].map((f) => (
                <div className="profile-field" key={f.label}>
                  <div className="profile-field__label">{f.label}</div>
                  <div className="profile-field__value">{f.value}</div>
                </div>
              ))}
            </div>
            {batch.status === 'inactive' && (
              <button
                type="button"
                className="btn"
                style={{ marginTop: 16 }}
                disabled={activate.isPending}
                onClick={() => activate.mutate(batch.id, { onSuccess: onClose })}
              >
                Activate Batch
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function BatchEdit({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: batch, isLoading } = useBatch(id)
  const update = useUpdateBatch()
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<BatchStatus>('active')

  useEffect(() => {
    if (batch) {
      setName(batch.name)
      setStartDate(toInputDate(batch.startDate))
      setEndDate(toInputDate(batch.endDate))
      setStatus(batch.status)
    }
  }, [batch])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    update.mutate(
      {
        id,
        dto: {
          name,
          startDate,
          endDate: endDate || null,
          status,
        },
      },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>Edit Batch</h2>
        <button type="button" className="btn secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
      <div className="card-body">
        {isLoading ? (
          <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
        ) : (
          <form onSubmit={submit}>
            {update.isError && (
              <p style={{ color: 'crimson', marginBottom: 12 }}>
                {(update.error as Error)?.message}
              </p>
            )}
            <div className="profile-fields">
              <div className="profile-field">
                <div className="profile-field__label">Name</div>
                <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">Start Date</div>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={inputStyle} />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">End Date (optional)</div>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">Status</div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BatchStatus)}
                  style={inputStyle}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn" style={{ marginTop: 16 }} disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Setup Wizard ────────────────────────────────────────────────────────────

function SetupTab({ onDone }: { onDone: () => void }) {
  const setup = useSetupAcademic()
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [yearName, setYearName] = useState('')
  const [yearStart, setYearStart] = useState('')
  const [yearEnd, setYearEnd] = useState('')

  const [s1Name, setS1Name] = useState('Session 1')
  const [s1Start, setS1Start] = useState('')
  const [s1End, setS1End] = useState('')
  const [s2Name, setS2Name] = useState('Session 2')
  const [s2Start, setS2Start] = useState('')
  const [s2End, setS2End] = useState('')

  const [batchName, setBatchName] = useState('')
  const [batchStart, setBatchStart] = useState('')
  const [batchEnd, setBatchEnd] = useState('')

  const validateStep = () => {
    setError(null)
    if (step === 0) {
      if (!yearName || !yearStart || !yearEnd) {
        setError('All year fields are required')
        return false
      }
      if (!isValidRange(yearStart, yearEnd)) {
        setError('Year end must be after start')
        return false
      }
      return true
    }
    if (step === 1) {
      if (!s1Name || !s1Start || !s1End || !s2Name || !s2Start || !s2End) {
        setError('All session fields are required')
        return false
      }
      if (!isValidRange(s1Start, s1End) || !isValidRange(s2Start, s2End)) {
        setError('Each session end must be after start')
        return false
      }
      const yS = new Date(yearStart)
      const yE = new Date(yearEnd)
      if (
        new Date(s1Start) < yS ||
        new Date(s1End) > yE ||
        new Date(s2Start) < yS ||
        new Date(s2End) > yE
      ) {
        setError('Sessions must fall within the academic year')
        return false
      }
      if (
        new Date(s1Start) < new Date(s2End) &&
        new Date(s2Start) < new Date(s1End)
      ) {
        setError('Sessions must not overlap')
        return false
      }
      return true
    }
    if (step === 2) {
      if (!batchName || !batchStart) {
        setError('Batch name and start date are required')
        return false
      }
      if (batchEnd && !isValidRange(batchStart, batchEnd)) {
        setError('Batch end must be after start')
        return false
      }
      return true
    }
    return true
  }

  const next = () => {
    if (!validateStep()) return
    setStep((s) => s + 1)
  }

  const submit = () => {
    if (!validateStep()) return
    const payload: AcademicSetupPayload = {
      year: { name: yearName, startDate: yearStart, endDate: yearEnd },
      sessions: [
        { name: s1Name, startDate: s1Start, endDate: s1End },
        { name: s2Name, startDate: s2Start, endDate: s2End },
      ],
      batch: {
        name: batchName,
        startDate: batchStart,
        endDate: batchEnd || undefined,
      },
    }
    setup.mutate(payload, {
      onSuccess: () => onDone(),
      onError: (err: any) => {
        setError(
          err?.response?.data?.message ?? err?.message ?? 'Setup failed',
        )
      },
    })
  }

  const steps = ['Academic Year', 'Sessions (2)', 'Batch', 'Review']

  return (
    <div className="card-body">
      {/* Horizontal stepper */}
<div
  style={{
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: '8px 4px',
  }}
>
  {steps.map((label, i) => {
    const done = i < step
    const active = i === step
    return (
      <div
        key={label}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* connector line (left of this step) */}
        {i > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: '50%',
              width: '100%',
              height: 2,
              background: done || active ? 'var(--brand, #1b5e3b)' : 'var(--line, #e0e0e0)',
              zIndex: 0,
            }}
          />
        )}

        {/* circle */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            zIndex: 1,
            background: done || active ? 'var(--brand, #1b5e3b)' : '#fff',
            color: done || active ? '#fff' : 'var(--ink-faint, #999)',
            border: done || active
              ? '2px solid var(--brand, #1b5e3b)'
              : '2px solid var(--line, #e0e0e0)',
          }}
        >
          {done ? '✓' : i + 1}
        </div>

        {/* title */}
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            fontWeight: active ? 700 : 500,
            color: active || done ? 'var(--ink, #222)' : 'var(--ink-faint, #999)',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {label}
        </div>
      </div>
    )
  })}
</div>

      {error && (
        <p style={{ color: 'crimson', marginBottom: 12 }}>{error}</p>
      )}

      {step === 0 && (
        <div className="profile-fields">
          <div className="profile-field">
            <div className="profile-field__label">Year Name</div>
            <input value={yearName} onChange={(e) => setYearName(e.target.value)} placeholder="e.g. 2026-27" style={inputStyle} />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Start Date</div>
            <input type="date" value={yearStart} onChange={(e) => setYearStart(e.target.value)} style={inputStyle} />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">End Date</div>
            <input type="date" value={yearEnd} onChange={(e) => setYearEnd(e.target.value)} style={inputStyle} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="profile-fields">
          <div className="subj-title" style={{ marginBottom: 8 }}>Session 1</div>
          <div className="profile-field">
            <div className="profile-field__label">Name</div>
            <input value={s1Name} onChange={(e) => setS1Name(e.target.value)} style={inputStyle} />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Start</div>
            <input type="date" value={s1Start} onChange={(e) => setS1Start(e.target.value)} style={inputStyle} />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">End</div>
            <input type="date" value={s1End} onChange={(e) => setS1End(e.target.value)} style={inputStyle} />
          </div>
          <div className="subj-title" style={{ margin: '16px 0 8px' }}>Session 2</div>
          <div className="profile-field">
            <div className="profile-field__label">Name</div>
            <input value={s2Name} onChange={(e) => setS2Name(e.target.value)} style={inputStyle} />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Start</div>
            <input type="date" value={s2Start} onChange={(e) => setS2Start(e.target.value)} style={inputStyle} />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">End</div>
            <input type="date" value={s2End} onChange={(e) => setS2End(e.target.value)} style={inputStyle} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="profile-fields">
          <div className="profile-field">
            <div className="profile-field__label">Batch Name</div>
            <input value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g. Batch 2026" style={inputStyle} />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Start Date</div>
            <input type="date" value={batchStart} onChange={(e) => setBatchStart(e.target.value)} style={inputStyle} />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">End Date (optional)</div>
            <input type="date" value={batchEnd} onChange={(e) => setBatchEnd(e.target.value)} style={inputStyle} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="profile-fields">
          <div className="profile-field">
            <div className="profile-field__label">Year</div>
            <div className="profile-field__value">
              {yearName} ({yearStart} → {yearEnd})
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Session 1</div>
            <div className="profile-field__value">
              {s1Name} ({s1Start} → {s1End})
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Session 2</div>
            <div className="profile-field__value">
              {s2Name} ({s2Start} → {s2End})
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Batch</div>
            <div className="profile-field__value">
              {batchName} ({batchStart}
              {batchEnd ? ` → ${batchEnd}` : ' ongoing'})
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        {step > 0 && (
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setError(null)
              setStep((s) => s - 1)
            }}
            disabled={setup.isPending}
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" className="btn" onClick={next}>
            Next
          </button>
        ) : (
          <button
            type="button"
            className="btn"
            onClick={submit}
            disabled={setup.isPending}
          >
            {setup.isPending ? 'Creating…' : 'Create Academic Setup'}
          </button>
        )}
      </div>
    </div>
  )
}