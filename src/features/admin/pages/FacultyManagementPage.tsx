import { useState, useEffect } from 'react'
import { useFaculty, useUpdateFacultyStatus, useFacultyById } from '../../../hooks/useFacultyQueries'
import type { FacultyStatus } from '../../../api/faculty'

// Faculty Management with search-on-demand and pagination
const ALL_STATUSES: (FacultyStatus | 'all')[] = ['all', 'active', 'inactive']

const statusClass: Record<FacultyStatus, string> = {
  active: 'active',
  inactive: 'inactive',
}

function FacultyManagementPage() {
  const [filterStatus, setFilterStatus] = useState<FacultyStatus | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [page, setPage] = useState(1)

  // Debounce search input
  useEffect(() => {
    if (!searchInput.trim()) {
      // If search is cleared, don't trigger auto-search
      return
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setHasSearched(true)
      setPage(1) // Reset to first page on new search
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchInput])

  const status = filterStatus === 'all' ? undefined : filterStatus

  // Only fetch when user has explicitly searched or clicked "Show All"
  const {
    data: facultyData,
    isLoading,
    isError,
    error,
    refetch,
  } = useFaculty({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    status,
  }, hasSearched) // Only enabled when hasSearched is true

  const updateStatusMutation = useUpdateFacultyStatus()

  const faculty = facultyData?.data ?? []
  const meta = facultyData?.meta

  const handleSearch = () => {
    setHasSearched(true)
    setPage(1)
    setDebouncedSearch(searchInput)
  }

  const handleShowAll = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setHasSearched(true)
    setPage(1)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setHasSearched(false)
    setPage(1)
  }

  const handleStatusChange = async (id: string, newStatus: FacultyStatus) => {
    await updateStatusMutation.mutateAsync({ id, status: newStatus })
  }

  if (selectedId) {
    return <FacultyDetail id={selectedId} onBack={() => setSelectedId(null)} />
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Faculty Management</h1>
          <div className="today">
            Manage faculty members and teaching assignments.
          </div>
        </div>
        <button type="button" className="btn">+ New Faculty</button>
      </div>

      <div className="card">
        {/* Status filter tabs */}
        <div className="tabs-row">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`tab-btn${filterStatus === s ? ' active' : ''}`}
              onClick={() => {
                setFilterStatus(s)
                setPage(1)
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div
          className="card-head"
          style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
        >
          <span className="meta">
            {!hasSearched
              ? 'Use search or click "Show All" to view faculty'
              : isLoading
              ? 'Loading...'
              : `${meta?.total ?? 0} member${(meta?.total ?? 0) !== 1 ? 's' : ''}`}
            {filterStatus !== 'all' ? ` · ${filterStatus}` : ''}
          </span>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search name, email, or employee #..."
              style={{
                padding: '6px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                fontSize: 13,
                width: 260,
              }}
            />
            <button
              type="button"
              className="btn secondary"
              onClick={handleSearch}
              disabled={!searchInput.trim()}
            >
              Search
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={handleShowAll}
            >
              Show All
            </button>
            {hasSearched && (
              <>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleClearSearch}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => refetch()}
                >
                  Refresh
                </button>
              </>
            )}
          </div>
        </div>

        {!hasSearched && (
          <div className="card-body">
            <p style={{ textAlign: 'center', color: 'var(--ink-faint)', margin: '40px 0' }}>
              <strong>Search for faculty members</strong> by name, email, or employee number,<br />
              or click <strong>"Show All"</strong> to view all faculty members.
            </p>
          </div>
        )}

        {hasSearched && (
          <>
            {isError && (
              <div className="card-body">
                <p style={{ color: 'var(--red)', marginBottom: 12 }}>
                  {(error as Error)?.message ?? 'Failed to load faculty'}
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
                      <th>Employee #</th>
                      <th>Name</th>
                      <th className="col-hide-sm">Designation</th>
                      <th className="col-hide-sm">Email</th>
                      <th className="col-hide-sm">Phone</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
                          Loading faculty members...
                        </td>
                      </tr>
                    )}
                    {!isLoading && faculty.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            textAlign: 'center',
                            color: 'var(--ink-faint)',
                            fontStyle: 'italic',
                          }}
                        >
                          No faculty members found
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      faculty.map((f) => (
                        <tr key={f.id}>
                          <td>
                            <div className="subj-title">{f.employeeNumber}</div>
                          </td>
                          <td>
                            <div className="subj-title">
                              {f.firstName} {f.middleName} {f.lastName}
                            </div>
                            <div className="subj-sub col-show-sm">
                              {f.designation || 'No designation'}
                            </div>
                          </td>
                          <td className="subj-sub col-hide-sm">
                            {f.designation || '—'}
                          </td>
                          <td className="subj-sub col-hide-sm">{f.email || '—'}</td>
                          <td className="subj-sub col-hide-sm">{f.phone || '—'}</td>
                          <td>
                            <span className={`status ${statusClass[f.status]}`}>
                              {f.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn secondary"
                              style={{
                                padding: '4px 10px',
                                fontSize: 12,
                                marginRight: 4,
                              }}
                              onClick={() => setSelectedId(f.id)}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="btn secondary"
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              disabled={updateStatusMutation.isPending}
                              onClick={() =>
                                handleStatusChange(
                                  f.id,
                                  f.status === 'active' ? 'inactive' : 'active'
                                )
                              }
                            >
                              {f.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {meta && meta.totalPages > 1 && (
              <div
                className="card-body"
                style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn secondary"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span className="meta">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn secondary"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
                <span className="meta">
                  Showing {(page - 1) * meta.limit + 1} -{' '}
                  {Math.min(page * meta.limit, meta.total)} of {meta.total}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

function FacultyDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { data: faculty, isLoading } = useFacultyById(id)

  if (isLoading) {
    return (
      <div className="card-body">
        <p style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>Loading...</p>
      </div>
    )
  }

  if (!faculty) {
    return (
      <div className="card-body">
        <p style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
          Faculty member not found
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="btn secondary" onClick={onBack}>
            ← Back
          </button>
          <div>
            <h1 style={{ marginBottom: 2 }}>
              {faculty.firstName} {faculty.middleName} {faculty.lastName}
            </h1>
            <div className="today">{faculty.designation || 'Faculty Member'}</div>
          </div>
        </div>
        <span className={`status ${statusClass[faculty.status]}`}>
          {faculty.status}
        </span>
      </div>

      <div className="profile-grid">
        <div className="card">
          <div className="card-head">
            <h2>Personal Information</h2>
          </div>
          <div className="profile-fields">
            {[
              { label: 'Employee Number', value: faculty.employeeNumber },
              {
                label: 'Full Name',
                value: `${faculty.firstName} ${faculty.middleName || ''} ${faculty.lastName || ''}`.trim(),
              },
              { label: 'Email', value: faculty.email || '—' },
              { label: 'Phone', value: faculty.phone || '—' },
              { label: 'CNIC', value: faculty.cnic || '—' },
              { label: 'Date of Birth', value: faculty.dateOfBirth || '—' },
              { label: 'Gender', value: faculty.gender || '—' },
              { label: 'Address', value: faculty.address || '—' },
              { label: 'City', value: faculty.city || '—' },
            ].map((f) => (
              <div className="profile-field" key={f.label}>
                <div className="profile-field__label">{f.label}</div>
                <div className="profile-field__value">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-head">
              <h2>Professional Information</h2>
            </div>
            <div className="profile-fields">
              {[
                { label: 'Designation', value: faculty.designation || '—' },
                { label: 'Qualification', value: faculty.qualification || '—' },
                { label: 'Joining Date', value: faculty.joiningDate || '—' },
                { label: 'Status', value: faculty.status },
              ].map((f) => (
                <div className="profile-field" key={f.label}>
                  <div className="profile-field__label">{f.label}</div>
                  <div className="profile-field__value">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {faculty.user && (
            <div className="card">
              <div className="card-head">
                <h2>User Account</h2>
              </div>
              <div className="profile-fields">
                <div className="profile-field">
                  <div className="profile-field__label">Username</div>
                  <div className="profile-field__value">{faculty.user.username}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default FacultyManagementPage
