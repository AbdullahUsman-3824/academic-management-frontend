import { useUpdateFacultyStatus } from '../../../../../hooks/useFacultyQueries';
import type { FacultyStatus } from '../../../../../api/faculty';
import type { useFaculty } from '../../../../../hooks/useFacultyQueries';

const statusClass: Record<FacultyStatus, string> = {
  active: 'active',
  inactive: 'inactive',
};

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 5,
  border: '1px solid var(--line)',
  fontSize: 13,
  width: '100%',
  maxWidth: 360,
};

type Props = {
  statusFilter: FacultyStatus | 'all';
  setStatusFilter: (s: FacultyStatus | 'all') => void;
  searchInput: string;
  setSearchInput: (v: string) => void;
  onSearch: () => void;
  page: number;
  setPage: (p: number) => void;
  list: ReturnType<typeof useFaculty>;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
};

export default function FacultyList({
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
  const { data, isLoading, isError, error, refetch } = list;
  const statusMutation = useUpdateFacultyStatus();
  const rows = data?.data ?? [];
  const meta = data?.meta;

  const statuses: (FacultyStatus | 'all')[] = ['all', 'active', 'inactive'];

  return (
    <>
      <div className="tabs-row">
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
            : `${meta?.total ?? 0} faculty member${(meta?.total ?? 0) !== 1 ? 's' : ''}`}
          {statusFilter !== 'all' ? ` · ${statusFilter}` : ''}
        </span>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search name, email, or employee #…"
            style={{ ...inputStyle, maxWidth: 250 }}
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
                    Loading faculty…
                  </td>
                </tr>
              )}
              {!isLoading && rows.length === 0 && (
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
                rows.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="subj-title">{f.employeeNumber}</div>
                    </td>
                    <td>
                      <div className="subj-title">
                        {f.firstName} {f.middleName} {f.lastName}
                      </div>
                    </td>
                    <td className="subj-sub col-hide-sm">{f.designation || '—'}</td>
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
                        style={{ padding: '4px 10px', fontSize: 12, marginRight: 4 }}
                        onClick={() => onView(f.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: '4px 10px', fontSize: 12, marginRight: 4 }}
                        onClick={() => onEdit(f.id)}
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
                            id: f.id,
                            status: f.status === 'active' ? 'inactive' : 'active',
                          })
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
  );
}
