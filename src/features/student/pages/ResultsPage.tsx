import { useState } from 'react'
import { semesterResults, academicHistory } from '../data/mockStudent'

function ResultsPage() {
  const [activeId, setActiveId] = useState(semesterResults.at(-1)?.id ?? semesterResults[0].id)
  const activeSemester = semesterResults.find((s) => s.id === activeId) ?? semesterResults[0]

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Results</h1>
          <div className="today">Subject-wise results by semester, and your complete academic history.</div>
        </div>
      </div>

      <div className="layout">
        <div className="col-main">
          <div className="card">
            <div className="card-head results-tabs">
              {semesterResults.map((semester) => (
                <button
                  key={semester.id}
                  type="button"
                  className={`tab-btn${semester.id === activeId ? ' active' : ''}`}
                  onClick={() => setActiveId(semester.id)}
                >
                  {semester.label}
                </button>
              ))}
            </div>

            {activeSemester.status === 'in-progress' ? (
              <div className="card-body">
                <span className="status pending">Not yet finalized</span>
                <p className="page-placeholder__todo" style={{ marginTop: 10 }}>
                  Results for {activeSemester.label} will appear here once the Administrator finalizes them.
                </p>
              </div>
            ) : null}

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Subject</th>
                    <th className="col-hide-sm">Credit hrs</th>
                    <th>Grade</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSemester.subjects.map((subject) => (
                    <tr key={subject.code}>
                      <td className="code">{subject.code}</td>
                      <td className="subj-title">{subject.title}</td>
                      <td className="col-hide-sm">
                        <span className="credit-pill">{subject.credits}</span>
                      </td>
                      <td>{subject.grade}</td>
                      <td>{subject.points}</td>
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
              <h2>Academic History</h2>
            </div>
            <div className="card-body">
              <div className="stats">
                <div className="stat">
                  <div className="num">{academicHistory.cgpa}</div>
                  <div className="lbl">CGPA</div>
                </div>
                <div className="stat">
                  <div className="num">{academicHistory.creditsEarned}</div>
                  <div className="lbl">Credits earned</div>
                </div>
              </div>

              <ul className="semester-history-list">
                {semesterResults.map((semester) => (
                  <li key={semester.id}>
                    <span>{semester.label}</span>
                    <span className={semester.status === 'finalized' ? 'subj-title' : 'subj-sub'}>
                      {semester.gpa ?? 'In progress'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResultsPage