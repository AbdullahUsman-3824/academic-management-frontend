import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { StatusFilterBar } from '../../components/StatusFilterBar'
import { useAcademicYears } from '../../hooks/useAcademicQueries'
import type { AcademicYear } from '../../../../api/academics'
import { adminPaths } from '../../data/navData'

const statusClass: Record<string, string> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'ok',
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function YearsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data, isLoading, isError, error, refetch } = useAcademicYears(
    statusFilter === 'all' ? undefined : statusFilter,
  )

  const years: AcademicYear[] = data ?? []

  return (
    <>
      <div
        className="card-head"
        style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
      >
        <span className="meta">
          {isLoading
            ? 'Loading…'
            : `${years.length} academic year${years.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <StatusFilterBar
        meta={null}
        filters={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
              { value: 'all', label: 'All' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'COMPLETED', label: 'Completed' },
            ],
            onChange: setStatusFilter,
          },
        ]}
        onRefresh={() => refetch()}
      />

      {isError && (
        <div className="card-body">
          <p style={{ color: 'crimson', marginBottom: 12 }}>
            {(error as Error)?.message ?? 'Failed to load academic years'}
          </p>
          <button type="button" className="btn secondary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {isLoading && <LoadingSpinner label="Loading academic years…" />}

      {!isLoading && !isError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th className="col-hide-sm">Start Date</th>
                <th className="col-hide-sm">End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {years.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: 'center',
                      padding: '32px 16px',
                    }}
                  >
                    <p style={{ color: 'var(--ink-faint)', marginBottom: 12 }}>
                      No academic years found
                    </p>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => navigate(`${adminPaths.academics}/setup`)}
                    >
                      Setup Academic Year
                    </button>
                  </td>
                </tr>
              )}

              {years.map((year) => (
                <tr key={year.id}>
                  <td>
                    <div className="subj-title">{year.name}</div>
                  </td>
                  <td className="col-hide-sm subj-sub">
                    {formatDate(year.startDate)}
                  </td>
                  <td className="col-hide-sm subj-sub">
                    {formatDate(year.endDate)}
                  </td>
                  <td>
                    <span className={`status ${statusClass[year.status] ?? ''}`}>
                      {year.status}
                    </span>
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