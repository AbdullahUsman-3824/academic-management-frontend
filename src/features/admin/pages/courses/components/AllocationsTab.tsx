import { useState } from 'react'
import {
  useAllocations,
  useDeleteAllocation,
} from '../../../../../hooks/useAllocationQueries'
import { useBatches, useEnrollmentSections } from '../../../hooks/useAcademicQueries'
import AllocationForm from './AllocationForm'

export default function AllocationsTab() {
  const [sectionId, setSectionId] = useState<string>('')
  const [batchId, setBatchId] = useState<string>('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)

  const { data: batches } = useBatches('ACTIVE')
  const { data: sections } = useEnrollmentSections(batchId || null)

  const {
    data: allocationsResult,
    isLoading,
    refetch,
  } = useAllocations({
    sectionId: sectionId || undefined,
    status: 'active',
    page,
    limit: 20,
  })

  const deleteMutation = useDeleteAllocation()

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this allocation?')) return
    await deleteMutation.mutateAsync(id)
  }

  const allocations = allocationsResult?.data || []
  const pagination = allocationsResult?.pagination

  return (
    <>
      <div
        className="card-head"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <h2 style={{ margin: 0, fontSize: 16 }}>Course Allocations</h2>
        <button
          type="button"
          className="btn"
          onClick={() => setShowForm(true)}
        >
          + New Allocation
        </button>
      </div>

      <div
        className="card-head"
        style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <select
            value={batchId}
            onChange={(e) => {
              setBatchId(e.target.value)
              setSectionId('')
              setPage(1)
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 5,
              border: '1px solid var(--line)',
              fontSize: 13,
              minWidth: 150,
            }}
          >
            <option value="">Select Batch</option>
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>

          {batchId && (
            <select
              value={sectionId}
              onChange={(e) => {
                setSectionId(e.target.value)
                setPage(1)
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                fontSize: 13,
                minWidth: 150,
              }}
            >
              <option value="">Select Section</option>
              {sections?.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="btn secondary"
            onClick={() => refetch()}
            style={{ marginLeft: 'auto' }}
            disabled={!sectionId}
          >
            Refresh
          </button>
        </div>
      </div>

      <div
        className="card-head"
        style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
      >
        <span className="meta">
          {isLoading
            ? 'Loading...'
            : pagination
              ? `${pagination.total} allocation${pagination.total !== 1 ? 's' : ''} (Page ${pagination.page} of ${pagination.totalPages})`
              : 'Select batch and section to view allocations'}
        </span>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Course</th>
              <th className="col-hide-sm">Section</th>
              <th className="col-hide-sm">Semester</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!batchId || !sectionId ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: 'center',
                    color: 'var(--ink-faint)',
                    fontStyle: 'italic',
                    padding: '40px 20px',
                  }}
                >
                  Please select a batch and section to view allocations
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: 'center', color: 'var(--ink-faint)' }}
                >
                  Loading allocations...
                </td>
              </tr>
            ) : !allocations || allocations.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: 'center',
                    color: 'var(--ink-faint)',
                    fontStyle: 'italic',
                  }}
                >
                  No allocations found for this section
                </td>
              </tr>
            ) : (
              allocations.map((alloc) => (
                <tr key={alloc.id}>
                  <td>
                    <div className="subj-title">
                      {alloc.faculty?.firstName} {alloc.faculty?.lastName}
                    </div>
                    <div className="subj-sub col-hide-sm">
                      {alloc.faculty?.employeeNumber}
                    </div>
                  </td>
                  <td>
                    <div className="subj-title">{alloc.course?.code}</div>
                    <div className="subj-sub col-hide-sm">
                      {alloc.course?.name}
                    </div>
                  </td>
                  <td className="subj-sub col-hide-sm">
                    {alloc.section?.name}
                  </td>
                  <td className="subj-sub col-hide-sm">
                    Semester {alloc.semesterNumber}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(alloc.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div
          className="card-head"
          style={{
            borderTop: '1px solid var(--line)',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <button
            type="button"
            className="btn secondary"
            disabled={page === 1 || isLoading}
            onClick={() => setPage(page - 1)}
            style={{ padding: '4px 12px', fontSize: 13 }}
          >
            ← Previous
          </button>
          <span className="meta">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="btn secondary"
            disabled={page === pagination.totalPages || isLoading}
            onClick={() => setPage(page + 1)}
            style={{ padding: '4px 12px', fontSize: 13 }}
          >
            Next →
          </button>
        </div>
      )}

      {showForm && <AllocationForm onClose={() => setShowForm(false)} />}
    </>
  )
}
