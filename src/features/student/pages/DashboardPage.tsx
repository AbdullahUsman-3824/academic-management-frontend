import { Link } from 'react-router-dom'
import { studentRoutes } from '../../../app/router/routes'
import {
  student,
  subjects,
  semesterResults,
  academicHistory,
  feeStatus,
  announcements,
  marks,
} from '../data/mockStudent'

const recentAssessments = marks.slice(0, 3)
const recentAnnouncements = announcements.slice(0, 3)
const lastFinalizedSemester = semesterResults.filter((s) => s.status === 'finalized').at(-1)
const academicStanding = [
  { label: 'Last Sem GPA', value: lastFinalizedSemester?.gpa ?? '—' },
  { label: 'CGPA', value: academicHistory.cgpa },
  { label: 'Credits earned', value: academicHistory.creditsEarned },
]

function DashboardPage() {
  return (
    <>
      <div className="topbar">
        <div>
          <h1>Welcome, {student.greetingName}</h1>
          <div className="today">Monday, 24 August 2026</div>
        </div>
        <div className="topbar-right">
          <div className="tags">
            <span className="tag">{student.program}</span>
            <span className="tag">{student.section}</span>
            <span className="tag">{student.enrollmentStatus}</span>
          </div>
          <Link className="profile" to={studentRoutes.profile}>
            <div className="avatar">{student.initials}</div>
            <div>
              <div className="name">{student.name}</div>
              <div className="reg">{student.regNo}</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="layout">
        <div className="col-main">
          <div className="card">
            <div className="card-head">
              <h2>Enrolled Subjects</h2>
              <span className="meta">{subjects.length} subjects · 15 credit hrs</span>
            </div>
            {/* table-scroll wrapper enables horizontal scroll on narrow screens */}
            <div className="table-scroll">
              <table className="tbl-subjects">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Subject</th>
                    <th className="col-hide-sm">Faculty</th>
                    <th>Credit hrs</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.code}>
                      <td className="code">{subject.code}</td>
                      <td className="subj-title">{subject.title}</td>
                      <td className="subj-sub col-hide-sm">{subject.faculty}</td>
                      <td>
                        <span className="credit-pill">{subject.credits}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Recent Assessments</h2>
              <span className="meta">Updated 21 Aug</span>
            </div>
            <div className="table-scroll">
              <table className="tbl-assessments">
                <thead>
                  <tr>
                    <th>Assessment</th>
                    <th className="col-hide-sm">Subject</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssessments.map((item) => (
                    <tr key={item.title + item.subjectCode}>
                      <td>
                        <div className="subj-title">{item.title}</div>
                        {/* Subject shown inline on mobile since col is hidden */}
                        <div className="subj-sub col-show-sm">{item.subjectCode}</div>
                      </td>
                      <td className="subj-sub col-hide-sm">
                        {item.subjectCode} — {item.subjectTitle}
                      </td>
                      <td>{item.score}</td>
                      <td>
                        <span className={`status ${item.status}`}>{item.statusLabel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-side">
          <div className="card">
            <div className="card-head">
              <h2>Fee Status</h2>
            </div>
            <div className="card-body">
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Outstanding — Semester 3</div>
              <div className="fee-amount">
                {feeStatus.outstanding} <small>due</small>
              </div>
              <div className="fee-due">Due {feeStatus.dueDate}</div>

              <Link className="btn" to={studentRoutes.fees}>
                Download voucher
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Announcements</h2>
            </div>
            <div className="card-body" style={{ paddingBottom: 6 }}>
              {recentAnnouncements.map((item) => (
                <div className="announce" key={item.title}>
                  <span className="tag-label">{item.tag}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <div className="date">{item.date}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Academic Standing</h2>
            </div>
            <div className="card-body">
              <div className="stats">
                {academicStanding.map((stat) => (
                  <div className="stat" key={stat.label}>
                    <div className="num">{stat.value}</div>
                    <div className="lbl">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
