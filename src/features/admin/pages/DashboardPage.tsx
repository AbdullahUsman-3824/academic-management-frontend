import {
  institutionKPIs,
  dashboardStats,
  recentAdminActivity,
  semesters,
} from '../data/mockAdmin'

const currentSemester = semesters.find((s) => s.isCurrent)

function DashboardPage() {
  return (
    <>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <div className="today">
            {currentSemester?.label ?? 'No active semester'} &nbsp;·&nbsp;
            {institutionKPIs.currentSession}
          </div>
        </div>
        <div className="topbar-right">
          <span className="tag">{institutionKPIs.currentSemester}</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid">
        {dashboardStats.map((kpi) => (
          <div className="kpi-card" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="layout">
        <div className="col-main">
          {/* Fee collection summary */}
          <div className="card">
            <div className="card-head">
              <h2>Fee Collection — Current Semester</h2>
              <span className="meta">{institutionKPIs.currentSemester}</span>
            </div>
            <div className="card-body">
              <div className="stats">
                <div className="stat">
                  <div className="num">{institutionKPIs.feeCollectedThisSemester}</div>
                  <div className="lbl">Collected</div>
                </div>
                <div className="stat">
                  <div className="num">{institutionKPIs.feePendingThisSemester}</div>
                  <div className="lbl">Pending</div>
                </div>
                <div className="stat">
                  <div className="num">{institutionKPIs.feeCollectionRate}</div>
                  <div className="lbl">Collection rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="card">
            <div className="card-head">
              <h2>Recent Activity</h2>
              <span className="meta">Last 7 days</span>
            </div>
            <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
              <ul className="activity-list">
                {recentAdminActivity.map((item) => (
                  <li key={item.action + item.date}>
                    <div>
                      <div className="activity-action">{item.action}</div>
                      <div className="activity-detail">{item.detail}</div>
                    </div>
                    <div className="activity-date">{item.date}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-side">
          {/* Session overview */}
          <div className="card">
            <div className="card-head">
              <h2>Session Overview</h2>
            </div>
            <div className="profile-fields">
              {[
                { label: 'Academic Session', value: institutionKPIs.currentSession },
                { label: 'Current Semester', value: institutionKPIs.currentSemester },
                { label: 'Total Sections',   value: String(institutionKPIs.totalSections) },
                { label: 'Total Courses',    value: String(institutionKPIs.totalCourses) },
              ].map((f) => (
                <div className="profile-field" key={f.label}>
                  <div className="profile-field__label">{f.label}</div>
                  <div className="profile-field__value">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active semester quick info */}
          {currentSemester && (
            <div className="card">
              <div className="card-head">
                <h2>Active Semester</h2>
                <span className="status active">Active</span>
              </div>
              <div className="profile-fields">
                {[
                  { label: 'Semester',   value: currentSemester.label },
                  { label: 'Session',    value: currentSemester.session },
                  { label: 'Start Date', value: currentSemester.startDate },
                  { label: 'End Date',   value: currentSemester.endDate },
                  { label: 'Sections',   value: String(currentSemester.sections) },
                ].map((f) => (
                  <div className="profile-field" key={f.label}>
                    <div className="profile-field__label">{f.label}</div>
                    <div className="profile-field__value">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DashboardPage
