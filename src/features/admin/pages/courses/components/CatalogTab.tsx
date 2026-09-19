import { useUpdateCourseStatus } from '../../../../../hooks/useCourseQueries'
import type { CourseStatus } from '../../../../../api/courses'
import type { useCourses } from '../../../../../hooks/useCourseQueries'

const statusClass: Record<CourseStatus, string> = {
  active: 'active',
  inactive: 'inactive',
}

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 5,
  border: '1px solid var(--line)',
  fontSize: 13,
  width: '100%',
  maxWidth: 360,
}

type Props = {
  statusFilter: CourseStatus | 'all'
  setStatusFilter: (s: CourseStatus | 'all') => void
  searchInput: string
  setSearchInput: (v: string) => void
  onSearch: () => void
  page: number
  setPage: (p: number) => void
  list: ReturnType<typeof useCourses>
  onView: (id: string) => void
  onEdit: (id: string) => void
}

export default function CatalogTab({
  statusFilter,
  setStatusFilter,
  searchInput,
  setSearchInput,
  onSearch,
  page,
  setPage,
  list,
  onView,
  onEdit,
}: Props) {
  const { data, isLoading, isError, error, refetch } = list
  const statusMutation = useUpdateCourseStatus()
  const rows = data?.data ?? []
  const meta = data?.meta

  const statuses: (CourseStatus | 'all')[] = ['all', 'active', 'inactive']

  return (
    <>
      <div className="tabs-row" style={{ borderTop: '1px solid var(--line)' }}>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            className={`tab-btn${statusFilter === s ? ' active' : ''}`}
            onClick={() => setStatusFilter(s)}
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
          {isLoading
            ? 'Loading…'
            : `${meta?.total ?? 0} course${(meta?.total ?? 0) !== 1 ? 's' : ''}`}
          {statusFilter !== 'all' ? ` · ${statusFilter}` : ''}
        </span>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search code or name…"
            style={{ ...inputStyle, maxWidth: 220 }}
          />
          <button type="button" className="btn secondary" onClick={onSearch}>
            Search
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => refetch()}
          >
            Refresh
          </button>
        </div>
      </div>

      {isError && (
        <div className="card-body">
          <p style={{ color: 'var(--ink-faint)', marginBottom: 12 }}>
            {(error as Error)?.message ?? 'Failed to load courses'}
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
                <th>Code</th>
                <th>Name</th>
                <th className="col-hide-sm">Credits</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
                    Loading courses…
                  </td>
                </tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: 'center',
                      color: 'var(--ink-faint)',
                      fontStyle: 'italic',
                    }}
                  >
                    No courses found
                  </td>
                </tr>
              )}
              {!isLoading &&
                rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="subj-title">{c.code}</div>
                    </td>
                    <td>
                      <div className="subj-title">{c.name}</div>
                      {c.description && (
                        <div className="subj-sub col-hide-sm">
                          {c.description.length > 60
                            ? c.description.slice(0, 60) + '…'
                            : c.description}
                        </div>
                      )}
                    </td>
                    <td className="subj-sub col-hide-sm">{c.creditHours}</td>
                    <td>
                      <span className={`status ${statusClass[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: '4px 10px', fontSize: 12, marginRight: 4 }}
                        onClick={() => onView(c.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: '4px 10px', fontSize: 12, marginRight: 4 }}
                        onClick={() => onEdit(c.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({
                            id: c.id,
                            status: c.status === 'active' ? 'inactive' : 'active',
                          })
                        }
                      >
                        {c.status === 'active' ? 'Deactivate' : 'Activate'}
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
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
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
      )}
    </>
  )
}