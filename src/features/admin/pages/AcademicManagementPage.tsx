import { useState } from 'react'
import {
  semesters,
  sections,
  resultReviews,
  type SemesterStatus,
  type SectionStatus,
  type ResultReviewStatus,
} from '../data/mockAdmin'

type Tab = 'semesters' | 'sections' | 'results'

const statusLabel: Record<SemesterStatus, string> = {
  active:    'Active',
  upcoming:  'Upcoming',
  completed: 'Completed',
}

const sectionStatusLabel: Record<SectionStatus, string> = {
  active:   'Active',
  inactive: 'Inactive',
  closed:   'Closed',
}

const resultStatusLabel: Record<ResultReviewStatus, string> = {
  pending:   'Pending',
  submitted: 'Submitted',
  finalized: 'Finalized',
}

// Map status keys to CSS class names
const semStatusClass: Record<SemesterStatus, string> = {
  active:    'active',
  upcoming:  'upcoming',
  completed: 'ok',
}

const secStatusClass: Record<SectionStatus, string> = {
  active:   'active',
  inactive: 'inactive',
  closed:   'closed',
}

const resStatusClass: Record<ResultReviewStatus, string> = {
  pending:   'pending',
  submitted: 'submitted',
  finalized: 'finalized',
}

function AcademicManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('semesters')

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Academic Management</h1>
          <div className="today">
            Semester &amp; section administration, result review, and academic history oversight.
          </div>
        </div>
      </div>

      <div className="card">
        {/* Tab row */}
        <div className="tabs-row">
          {(['semesters', 'sections', 'results'] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-btn${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'semesters' ? 'Semesters'
               : tab === 'sections' ? 'Sections'
               : 'Result Review'}
            </button>
          ))}
        </div>

        {/* ── Semesters tab ─────────────────────────────────── */}
        {activeTab === 'semesters' && (
          <>
            <div
              className="card-head"
              style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
            >
              <span className="meta">{semesters.length} semesters across all sessions</span>
              <button type="button" className="btn">+ New Semester</button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Session</th>
                    <th className="col-hide-sm">Start Date</th>
                    <th className="col-hide-sm">End Date</th>
                    <th>Sections</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {semesters.map((sem) => (
                    <tr key={sem.id}>
                      <td>
                        <div className="subj-title">
                          {sem.label}
                          {sem.isCurrent && (
                            <span className="status current" style={{ marginLeft: 8 }}>
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="subj-sub">{sem.session}</td>
                      <td className="col-hide-sm subj-sub">{sem.startDate}</td>
                      <td className="col-hide-sm subj-sub">{sem.endDate}</td>
                      <td>{sem.sections}</td>
                      <td>
                        <span className={`status ${semStatusClass[sem.status]}`}>
                          {statusLabel[sem.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Sections tab ──────────────────────────────────── */}
        {activeTab === 'sections' && (
          <>
            <div
              className="card-head"
              style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
            >
              <span className="meta">{sections.length} sections shown</span>
              <button type="button" className="btn">+ New Section</button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Semester</th>
                    <th className="col-hide-sm">Shift</th>
                    <th>Enrolled</th>
                    <th className="col-hide-sm">Subjects</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((sec) => (
                    <tr key={sec.id}>
                      <td className="subj-title">{sec.name}</td>
                      <td className="subj-sub">{sec.semesterLabel}</td>
                      <td className="subj-sub col-hide-sm">{sec.shift}</td>
                      <td>
                        {sec.enrolledStudents}
                        <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}>
                          /{sec.capacity}
                        </span>
                      </td>
                      <td className="col-hide-sm">
                        <div className="chip-list">
                          {sec.subjects.map((s) => (
                            <span key={s} className="chip">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`status ${secStatusClass[sec.status]}`}>
                          {sectionStatusLabel[sec.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Result Review tab ─────────────────────────────── */}
        {activeTab === 'results' && (
          <>
            <div
              className="card-head"
              style={{ borderTop: 'none', borderBottom: '1px solid var(--line)' }}
            >
              <span className="meta">
                {resultReviews.filter((r) => r.status === 'submitted').length} awaiting review ·&nbsp;
                {resultReviews.filter((r) => r.status === 'finalized').length} finalized
              </span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Section</th>
                    <th className="col-hide-sm">Semester</th>
                    <th className="col-hide-sm">Faculty</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resultReviews.map((rr) => (
                    <tr key={rr.id}>
                      <td>
                        <div className="code">{rr.subject.split(' — ')[0]}</div>
                        <div className="subj-sub">{rr.subject.split(' — ')[1]}</div>
                      </td>
                      <td className="subj-sub">{rr.sectionName}</td>
                      <td className="subj-sub col-hide-sm">{rr.semesterLabel}</td>
                      <td className="subj-sub col-hide-sm">{rr.faculty}</td>
                      <td className="subj-sub">{rr.submittedDate}</td>
                      <td>
                        <span className={`status ${resStatusClass[rr.status]}`}>
                          {resultStatusLabel[rr.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default AcademicManagementPage
