import { useState } from 'react'
import {
  useAllocations,
  useAllocationsBySectionSemester,
  useDeleteAllocation,
} from '../../../../../hooks/useAllocationQueries'
import {
  useSemesters,
} from '../../../../../hooks/useSemesterCourseQueries'
import { useBatches, useEnrollmentSections, useAcademicSessionsList } from '../../../hooks/useAcademicQueries'
import AllocationForm from './AllocationForm'

type ViewMode = 'list' | 'section-overview'

export default function AllocationsTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [semesterId, setSemesterId] = useState<string>('')
  const [sectionId, setSectionId] = useState<string>('')
  const [batchId, setBatchId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [showForm, setShowForm] = useState(false)

  const { data: semesters } = useSemesters()
  const { data: batches } = useBatches('active')
  const { data: sections } = useEnrollmentSections(batchId || null)
  const { data: sessions } = useAcademicSessionsList()

  const {
    data: allocations,
    isLoading,
    refetch,
  } = useAllocations({
    semesterId: semesterId || undefined,
    sectionId: sectionId || undefined,
    academicSessionId: sessionId || undefined,
    status: 'active',
  })

  const {
    data: sectionOverview,
    isLoading: loadingOverview,
  } = useAllocationsBySectionSemester(
    viewMode === 'section-overview' && sectionId ? sectionId : null,
    viewMode === 'section-overview' && semesterId ? semesterId : null,
  )

  const deleteMutation = useDeleteAllocation()

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this allocation?')) return
    await deleteMutation.mutateAsync(id)
  }

  return (
    <>
      <div
        className="card-head"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${viewMode === 'list' ? '' : 'secondary'}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button
            type="button"
            className={`btn ${viewMode === 'section-overview' ? '' : 'secondary'}`}
            onClick={() => setViewMode('section-overview')}
          >
            Section Overview
          </button>
        </div>

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
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 5,
              border: '1px solid var(--line)',
              fontSize: 13,
              minWidth: 150,
            }}
          >
            <option value="">All Semesters</option>
            {semesters?.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.displayName}
              </option>
            ))}
          </select>

          <select
            value={batchId}
            onChange={(e) => {
              setBatchId(e.target.value)
              setSectionId('')
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 5,
              border: '1px solid var(--line)',
              fontSize: 13,
              minWidth: 150,
            }}
          >
            <option value="">All Batches</option>
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>

          {batchId && (
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                fontSize: 13,
                minWidth: 150,
              }}
            >
              <option value="">All Sections</option>
              {sections?.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 5,
              border: '1px solid var(--line)',
              fontSize: 13,
              minWidth: 150,
            }}
          >
            <option value="">All Sessions</option>
            {sessions?.map((sess) => (
              <option key={sess.id} value={sess.id}>
                {sess.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn secondary"
            onClick={() => refetch()}
            style={{ marginLeft: 'auto' }}
          >
            Refresh
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <>
          <div
            className="card-head"
            style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
          >
            <span className="meta">
              {isLoading
                ? 'Loading...'
                : `${allocations?.length ?? 0} allocation${(allocations?.length ?? 0) !== 1 ? 's' : ''}`}
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
                  <th className="col-hide-sm">Session</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: 'center', color: 'var(--ink-faint)' }}
                    >
                      Loading allocations...
                    </td>
                  </tr>
                )}
                {!isLoading && (!allocations || allocations.length === 0) && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: 'center',
                        color: 'var(--ink-faint)',
                        fontStyle: 'italic',
                      }}
                    >
                      No allocations found
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  allocations?.map((alloc) => (
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
                        {alloc.semester?.displayName}
                      </td>
                      <td className="subj-sub col-hide-sm">
                        {alloc.academicSession?.name}
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
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {viewMode === 'section-overview' && (
        <>
          {(!sectionId || !semesterId) && (
            <div className="card-body">
              <p style={{ color: 'var(--ink-faint)', margin: 0 }}>
                Select a section and semester to view allocation status.
              </p>
            </div>
          )}

          {sectionId && semesterId && (
            <>
              <div
                className="card-head"
                style={{
                  borderTop: 'none',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span className="meta">
                  {loadingOverview
                    ? 'Loading...'
                    : `${sectionOverview?.length ?? 0} course${(sectionOverview?.length ?? 0) !== 1 ? 's' : ''}`}
                </span>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Course Name</th>
                      <th className="col-hide-sm">Credits</th>
                      <th>Type</th>
                      <th>Faculty Assigned</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingOverview && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'center',
                            color: 'var(--ink-faint)',
                          }}
                        >
                          Loading...
                        </td>
                      </tr>
                    )}
                    {!loadingOverview &&
                      sectionOverview?.map((item) => (
                        <tr key={item.course.id}>
                          <td>
                            <div className="subj-title">{item.course.code}</div>
                          </td>
                          <td>
                            <div className="subj-title">{item.course.name}</div>
                          </td>
                          <td className="subj-sub col-hide-sm">
                            {item.course.creditHours}
                          </td>
                          <td>
                            <span
                              className={`status ${item.isCompulsory ? 'active' : 'inactive'}`}
                            >
                              {item.isCompulsory ? 'Compulsory' : 'Elective'}
                            </span>
                          </td>
                          <td>
                            {item.allocation ? (
                              <div>
                                <div className="subj-title">
                                  {item.allocation.faculty?.firstName}{' '}
                                  {item.allocation.faculty?.lastName}
                                </div>
                                <div className="subj-sub">
                                  {item.allocation.faculty?.employeeNumber}
                                </div>
                              </div>
                            ) : (
                              <span
                                style={{
                                  color: 'var(--ink-faint)',
                                  fontStyle: 'italic',
                                }}
                              >
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`status ${item.allocation ? 'active' : 'inactive'}`}
                            >
                              {item.allocation ? 'Allocated' : 'Unallocated'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {showForm && <AllocationForm onClose={() => setShowForm(false)} />}
    </>
  )
}
