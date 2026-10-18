import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAllocationDetails, useAllocationStudents } from '../hooks/useFacultyQueries'

export default function CourseDetailPage() {
  const { allocationId } = useParams<{ allocationId: string }>()
  const navigate = useNavigate()
  const [searchStudent, setSearchStudent] = useState('')

  const { data: allocation, isLoading: loadingAllocation } = useAllocationDetails(allocationId || null)
  const { data: students, isLoading: loadingStudents } = useAllocationStudents(allocationId || null)

  const isLoading = loadingAllocation || loadingStudents

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
        Loading course details...
      </div>
    )
  }

  if (!allocation) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
        Course not found
      </div>
    )
  }

  const filteredStudents = students?.filter((item) => {
    const searchLower = searchStudent.toLowerCase()
    const fullName =
      `${item.student.firstName || ''} ${item.student.middleName || ''} ${item.student.lastName || ''}`
        .trim()
        .toLowerCase()
    return (
      fullName.includes(searchLower) ||
      item.student.stdRegNumber.toLowerCase().includes(searchLower) ||
      (item.student.email && item.student.email.toLowerCase().includes(searchLower))
    )
  })

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="btn secondary" onClick={() => navigate('/courses')}>
            ← Back
          </button>
          <div>
            <h1 style={{ marginBottom: 2 }}>{allocation.course.name}</h1>
            <div className="today">
              {allocation.course.code} · {allocation.section.name} · {allocation.section.batch.name}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn primary"
          onClick={() => navigate(`/courses/${allocationId}/assessments`)}
        >
          📝 Assessments
        </button>
      </div>

      {/* Course Info */}
      <div className="card">
        <div className="card-head">
          <h2>Course Information</h2>
        </div>
        <div className="profile-fields">
          <div className="profile-field">
            <div className="profile-field__label">Course Code</div>
            <div className="profile-field__value">{allocation.course.code}</div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Course Name</div>
            <div className="profile-field__value">{allocation.course.name}</div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Credit Hours</div>
            <div className="profile-field__value">{allocation.course.creditHours}</div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Section</div>
            <div className="profile-field__value">{allocation.section.name}</div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Batch</div>
            <div className="profile-field__value">{allocation.section.batch.name}</div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Semester</div>
            <div className="profile-field__value">Semester {allocation.semesterNumber}</div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Total Students</div>
            <div className="profile-field__value">{allocation.studentCount || 0}</div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Academic Session</div>
            <div className="profile-field__value">{allocation.academicSession.name}</div>
          </div>
        </div>
      </div>

      {/* Class Roster */}
      <div className="card">
        <div className="card-head">
          <h2>Class Roster</h2>
          <span className="meta">
            {filteredStudents?.length || 0} student{(filteredStudents?.length || 0) !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <input
            type="search"
            placeholder="Search by name, reg no, or email..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 400,
              padding: '8px 12px',
              border: '1px solid var(--line)',
              borderRadius: 5,
              fontSize: 14,
            }}
          />
        </div>

        {!filteredStudents || filteredStudents.length === 0 ? (
          <div className="card-body">
            <p style={{ color: 'var(--ink-faint)', margin: 0, textAlign: 'center', padding: 20 }}>
              {searchStudent ? 'No students match your search.' : 'No students enrolled in this course.'}
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th className="col-hide-sm">Email</th>
                  <th className="col-hide-sm">Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((item) => {
                  const fullName =
                    `${item.student.firstName || ''} ${item.student.middleName || ''} ${item.student.lastName || ''}`
                      .trim() || 'N/A'

                  return (
                    <tr key={item.enrollmentId}>
                      <td>
                        <div className="subj-title">{item.student.stdRegNumber}</div>
                      </td>
                      <td>
                        <div className="subj-title">{fullName}</div>
                        <div className="subj-sub col-show-sm">{item.student.email || 'No email'}</div>
                      </td>
                      <td className="col-hide-sm">
                        <span className="subj-sub">{item.student.email || 'N/A'}</span>
                      </td>
                      <td className="col-hide-sm">
                        <span className="subj-sub">{item.student.phone || 'N/A'}</span>
                      </td>
                      <td>
                        <span
                          className={`status ${item.status === 'enrolled' ? 'active' : item.status === 'completed' ? 'completed' : 'inactive'}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
