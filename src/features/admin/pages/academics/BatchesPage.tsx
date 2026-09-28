import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { StatusFilterBar } from '../../components/StatusFilterBar'
import { useBatches } from '../../hooks/useAcademicQueries'
import type { Batch } from '../../../../api/academics'
import { adminPaths } from '../../data/navData'

const statusClass: Record<string, string> = {
  ACTIVE: 'active',
  COMPLETED: 'ok',
  CANCELLED: 'closed',
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function BatchesPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data, isLoading, isError, error, refetch } = useBatches(
    statusFilter === 'all' ? undefined : statusFilter,
  )

  const batches: Batch[] = data ?? []

  return (
    <>
      <div
        className="card-head"
        style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
      >
        <span className="meta">
          {isLoading
            ? 'Loading…'
            : `${batches.length} batch${batches.length !== 1 ? 'es' : ''}`}
        </span>
      </div>

      <StatusFilterBar
        filters={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
              { value: 'all', label: 'All' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ],
            onChange: setStatusFilter,
          },
        ]}
        onRefresh={() => refetch()}
      />

      {isError && (
        <div className="card-body">
          <p style={{ color: 'crimson', marginBottom: 12 }}>
            {(error as Error)?.message ?? 'Failed to load batches'}
          </p>
          <button type="button" className="btn secondary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {isLoading && <LoadingSpinner label="Loading batches…" />}

      {!isLoading && !isError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th className="col-hide-sm">Start</th>
                <th className="col-hide-sm">End</th>
                <th>Students</th>
                <th>Sections</th>
                <th>Capacity</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: 'center',
                      color: 'var(--ink-faint)',
                      fontStyle: 'italic',
                    }}
                  >
                    No batches found
                  </td>
                </tr>
              )}

              {batches.map((batch) => (
                <tr key={batch.id}>
                  <td>
                    <div className="subj-title">{batch.name}</div>
                  </td>
                  <td className="col-hide-sm subj-sub">
                    {formatDate(batch.startDate)}
                  </td>
                  <td className="col-hide-sm subj-sub">
                    {formatDate(batch.endDate)}
                  </td>
                  <td>{batch.counts?.students ?? 0}</td>
                  <td>{batch.counts?.sections ?? 0}</td>
                  <td className="subj-sub">
                    {batch.sectionCapacity ?? '—'}
                  </td>
                  <td>
                    <span className={`status ${statusClass[batch.status] ?? ''}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() =>
                        navigate(
                          `${adminPaths.academics}/sections?batchId=${batch.id}`,
                        )
                      }
                    >
                      Manage Sections
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