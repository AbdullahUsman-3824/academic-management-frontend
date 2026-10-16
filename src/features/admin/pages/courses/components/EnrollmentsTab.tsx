import { useState } from 'react'
import {
  useEnrollments,
  useEnrollmentsByStudent,
  useUpdateEnrollmentStatus,
  useDropEnrollment,
  useDeleteEnrollment,
} from '../../../../../hooks/useEnrollmentQueries'
import { useStudents } from '../../../hooks/useStudentQueries'
import type { EnrollmentStatus } from '../../../../../api/enrollments'
import EnrollmentForm from './EnrollmentForm'

const statusClass: Record<EnrollmentStatus, string> = {
  enrolled: 'active',
  completed: 'active',
  dropped: 'inactive',
  failed: 'inactive',
  reappear: 'inactive',
}

export default function EnrollmentsTab() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'all'>(
    'all',
  )
  const [showForm, setShowForm] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const { data: studentsData } = useStudents({
    search: searchInput || undefined,
    status: 'active',
  })

  const {
    data: enrollments,
    isLoading,
    refetch,
  } = useEnrollments({
    studentId: selectedStudentId || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const updateStatusMutation = useUpdateEnrollmentStatus()
  const dropMutation = useDropEnrollment()
  const deleteMutation = useDeleteEnrollment()

  const students = studentsData?.data ?? []

  const handleUpdateStatus = async (id: string, status: EnrollmentStatus) => {
    if (!confirm(`Change status to ${status}?`)) return
    await updateStatusMutation.mutateAsync({ id, payload: { status } })
  }

  const handleDrop = async (id: string) => {
    if (!confirm('Drop this course enrollment?')) return
    await dropMutation.mutateAsync(id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this enrollment?')) return
    await deleteMutation.mutateAsync(id)
  }

  const statuses: (EnrollmentStatus | 'all')[] = [
    'all',
    'enrolled',
    'completed',
    'dropped',
    'failed',
    'reappear',
  ]

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
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search students..."
            style={{
              padding: '6px 10px',
              borderRadius: 5,
              border: '1px solid var(--line)',
              fontSize: 13,
              minWidth: 200,
            }}
          />

          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 5,
              border: '1px solid var(--line)',
              fontSize: 13,
              minWidth: 250,
            }}
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.studentNumber} - {student.firstName} {student.lastName}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn"
            onClick={() => setShowForm(true)}
            style={{ marginLeft: 'auto' }}
          >
            + New Enrollment
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
            : `${enrollments?.length ?? 0} enrollment${(enrollments?.length ?? 0) !== 1 ? 's' : ''}`}
        </span>
        <button type="button" className="btn secondary" onClick={() => refetch()}>
          Refresh
        </button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th className="col-hide-sm">Credits</th>
              <th>Status</th>
              <th className="col-hide-sm">Enrolled Date</th>
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
                  Loading enrollments...
                </td>
              </tr>
            )}
            {!isLoading && (!enrollments || enrollments.length === 0) && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    color: 'var(--ink-faint)',
                    fontStyle: 'italic',
                  }}
                >
                  No enrollments found
                </td>
              </tr>
            )}
            {!isLoading &&
              enrollments?.map((enr) => (
                <tr key={enr.id}>
                  <td>
                    <div className="subj-title">
                      {enr.studentAcademicRecord?.student?.firstName}{' '}
                      {enr.studentAcademicRecord?.student?.lastName}
                    </div>
                    <div className="subj-sub">
                      {enr.studentAcademicRecord?.student?.studentNumber}
                    </div>
                  </td>
                  <td>
                    <div className="subj-title">{enr.course?.code}</div>
                    <div className="subj-sub col-hide-sm">
                      {enr.course?.name}
                    </div>
                  </td>
                  <td className="subj-sub col-hide-sm">
                    {enr.course?.creditHours}
                    {enr.isExtra && (
                      <span
                        style={{
                          marginLeft: 4,
                          fontSize: 11,
                          color: 'var(--ink-faint)',
                        }}
                      >
                        (Extra)
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status ${statusClass[enr.status]}`}>
                      {enr.status}
                    </span>
                  </td>
                  <td className="subj-sub col-hide-sm">
                    {new Date(enr.enrolledAt).toLocaleDateString()}
                  </td>
                  <td>
                    <select
                      value="actions"
                      onChange={(e) => {
                        const action = e.target.value
                        if (action === 'drop') {
                          handleDrop(enr.id)
                        } else if (action === 'delete') {
                          handleDelete(enr.id)
                        } else if (
                          action === 'enrolled' ||
                          action === 'completed' ||
                          action === 'failed' ||
                          action === 'reappear'
                        ) {
                          handleUpdateStatus(enr.id, action as EnrollmentStatus)
                        }
                        e.target.value = 'actions'
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: 12,
                        border: '1px solid var(--line)',
                        borderRadius: 4,
                      }}
                    >
                      <option value="actions">Actions</option>
                      <option value="enrolled">Mark Enrolled</option>
                      <option value="completed">Mark Completed</option>
                      <option value="failed">Mark Failed</option>
                      <option value="reappear">Mark Reappear</option>
                      <option value="drop">Drop Course</option>
                      <option value="delete">Delete</option>
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showForm && <EnrollmentForm onClose={() => setShowForm(false)} />}
    </>
  )
}
