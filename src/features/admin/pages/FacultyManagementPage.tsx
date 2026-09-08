import { useState } from 'react'
import {
  facultyMembers,
  type FacultyMember,
  type FacultyStatus,
} from '../data/mockAdmin'

const ALL_STATUSES: (FacultyStatus | 'All')[] = ['All', 'Active', 'Inactive', 'On Leave']

const statusClass: Record<FacultyStatus, string> = {
  Active:    'active',
  Inactive:  'inactive',
  'On Leave': 'on-leave',
}

function FacultyDetail({ member, onBack }: { member: FacultyMember; onBack: () => void }) {
  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="btn secondary" onClick={onBack}>
            ← Back
          </button>
          <div>
            <h1 style={{ marginBottom: 2 }}>{member.name}</h1>
            <div className="today">{member.designation}</div>
          </div>
        </div>
        <span className={`status ${statusClass[member.status]}`}>{member.status}</span>
      </div>

      <div className="profile-grid">
        <div className="card">
          <div className="card-head"><h2>Contact &amp; Personal Info</h2></div>
          <div className="profile-fields">
            {[
              { label: 'Full Name',    value: member.name },
              { label: 'Designation', value: member.designation },
              { label: 'Email',       value: member.email },
              { label: 'Phone',       value: member.phone },
              { label: 'CNIC',        value: member.cnic },
              { label: 'Join Date',   value: member.joinDate },
            ].map((f) => (
              <div className="profile-field" key={f.label}>
                <div className="profile-field__label">{f.label}</div>
                <div className="profile-field__value">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Assigned Subjects</h2>
            <span className="meta">{member.assignedSubjects.length} subject{member.assignedSubjects.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="card-body">
            {member.assignedSubjects.length === 0 ? (
              <p style={{ color: 'var(--ink-faint)', fontStyle: 'italic', margin: 0 }}>
                No subjects assigned.
              </p>
            ) : (
              <div className="chip-list">
                {member.assignedSubjects.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function FacultyManagementPage() {
  const [filterStatus, setFilterStatus] = useState<FacultyStatus | 'All'>('All')
  const [selectedMember, setSelectedMember] = useState<FacultyMember | null>(null)

  const filtered =
    filterStatus === 'All'
      ? facultyMembers
      : facultyMembers.filter((f) => f.status === filterStatus)

  if (selectedMember) {
    return (
      <FacultyDetail
        member={selectedMember}
        onBack={() => setSelectedMember(null)}
      />
    )
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Faculty Management</h1>
          <div className="today">
            Add/edit faculty members, assign subjects, and manage account status.
          </div>
        </div>
        <button type="button" className="btn">+ Add Faculty</button>
      </div>

      <div className="card">
        {/* Status filter tabs */}
        <div className="tabs-row">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`tab-btn${filterStatus === s ? ' active' : ''}`}
              onClick={() => setFilterStatus(s as FacultyStatus | 'All')}
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
            {filtered.length} member{filtered.length !== 1 ? 's' : ''}
            {filterStatus !== 'All' ? ` · ${filterStatus}` : ''}
          </span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th className="col-hide-sm">Designation</th>
                <th className="col-hide-sm">Email</th>
                <th>Subjects</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="subj-title">{f.name}</div>
                    <div className="subj-sub col-show-sm">{f.designation}</div>
                  </td>
                  <td className="subj-sub col-hide-sm">{f.designation}</td>
                  <td className="subj-sub col-hide-sm">{f.email}</td>
                  <td>
                    {f.assignedSubjects.length === 0 ? (
                      <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>None</span>
                    ) : (
                      <span className="credit-pill">{f.assignedSubjects.length} subject{f.assignedSubjects.length !== 1 ? 's' : ''}</span>
                    )}
                  </td>
                  <td>
                    <span className={`status ${statusClass[f.status]}`}>{f.status}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => setSelectedMember(f)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                    No faculty members match the selected filter.
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

export default FacultyManagementPage
