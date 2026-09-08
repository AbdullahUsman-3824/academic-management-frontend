import { useState } from 'react'
import {
  adminStudents,
  type AdminStudent,
  type StudentStatus,
} from '../data/mockAdmin'

const ALL_STATUSES: (StudentStatus | 'All')[] = [
  'All', 'Active', 'Enrolled', 'Graduated', 'Suspended', 'Withdrawn', 'Deferred', 'Inactive',
]

// Map student status to CSS badge class
const statusClass: Record<StudentStatus, string> = {
  Active:    'active',
  Inactive:  'inactive',
  Enrolled:  'enrolled',
  Graduated: 'graduated',
  Suspended: 'suspended',
  Withdrawn: 'withdrawn',
  Deferred:  'deferred',
}

const feeStatusClass: Record<AdminStudent['feeStatus'], string> = {
  Paid:        'ok',
  Outstanding: 'overdue',
  Partial:     'pending',
}

function StudentDetail({ student, onBack }: { student: AdminStudent; onBack: () => void }) {
  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="btn secondary" onClick={onBack}>
            ← Back
          </button>
          <div>
            <h1 style={{ marginBottom: 2 }}>{student.name}</h1>
            <div className="today">
              {student.regNo} · {student.program}
            </div>
          </div>
        </div>
        <span className={`status ${statusClass[student.status]}`}>{student.status}</span>
      </div>

      <div className="profile-grid">
        <div className="card">
          <div className="card-head"><h2>Personal Information</h2></div>
          <div className="profile-fields">
            {[
              { label: 'Full Name',    value: student.name },
              { label: "Father's Name", value: student.fatherName },
              { label: 'CNIC',         value: student.cnic },
              { label: 'Phone',        value: student.phone },
              { label: 'Email',        value: student.email },
            ].map((f) => (
              <div className="profile-field" key={f.label}>
                <div className="profile-field__label">{f.label}</div>
                <div className="profile-field__value">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h2>Academic Enrollment</h2></div>
          <div className="profile-fields">
            {[
              { label: 'Registration No.', value: student.regNo },
              { label: 'Program',          value: student.program },
              { label: 'Semester',         value: student.currentSemester },
              { label: 'Section',          value: student.section },
              { label: 'Shift',            value: student.shift },
              { label: 'Admission Date',   value: student.admissionDate },
              { label: 'CGPA',             value: student.cgpa ?? 'N/A' },
            ].map((f) => (
              <div className="profile-field" key={f.label}>
                <div className="profile-field__label">{f.label}</div>
                <div className="profile-field__value">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h2>Account &amp; Fee Status</h2></div>
          <div className="profile-fields">
            {[
              {
                label: 'Account Status',
                value: (
                  <span className={`status ${statusClass[student.status]}`}>
                    {student.status}
                  </span>
                ),
              },
              {
                label: 'Fee Status',
                value: (
                  <span className={`status ${feeStatusClass[student.feeStatus]}`}>
                    {student.feeStatus}
                  </span>
                ),
              },
            ].map((f) => (
              <div className="profile-field" key={f.label}>
                <div className="profile-field__label">{f.label}</div>
                <div className="profile-field__value">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function StudentManagementPage() {
  const [filterStatus, setFilterStatus] = useState<StudentStatus | 'All'>('All')
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null)

  const filtered =
    filterStatus === 'All'
      ? adminStudents
      : adminStudents.filter((s) => s.status === filterStatus)

  if (selectedStudent) {
    return (
      <StudentDetail
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    )
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Student Management</h1>
          <div className="today">
            Registration, profiles, and status management for all students.
          </div>
        </div>
        <button type="button" className="btn">+ Register Student</button>
      </div>

      <div className="card">
        {/* Status filter tabs */}
        <div className="tabs-row">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`tab-btn${filterStatus === s ? ' active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div
          className="card-head"
          style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
        >
          <span className="meta">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''}
            {filterStatus !== 'All' ? ` · ${filterStatus}` : ''}
          </span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Reg. No.</th>
                <th>Student</th>
                <th className="col-hide-sm">Program / Semester</th>
                <th className="col-hide-sm">Section</th>
                <th>Fee</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="code">{s.regNo}</td>
                  <td>
                    <div className="subj-title">{s.name}</div>
                    <div className="subj-sub col-show-sm">{s.currentSemester}</div>
                  </td>
                  <td className="subj-sub col-hide-sm">
                    {s.program}
                    <div>{s.currentSemester}</div>
                  </td>
                  <td className="subj-sub col-hide-sm">{s.section}</td>
                  <td>
                    <span className={`status ${feeStatusClass[s.feeStatus]}`}>
                      {s.feeStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${statusClass[s.status]}`}>{s.status}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => setSelectedStudent(s)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                    No students match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default StudentManagementPage
