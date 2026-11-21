import { Link } from "react-router-dom";
import { studentRoutes } from "../data/navData";
import {
  useStudentMe,
  useStudentDashboard,
  useStudentMarks,
} from "../hooks/useStudentQueries";
import { getFirstName, getInitials, getErrorMessage } from "../utils";

function DashboardPage() {
  const me = useStudentMe();
  const dashboard = useStudentDashboard();
  const marks = useStudentMarks();

  const student = me.data;
  const courses = dashboard.data?.courses ?? [];
  const recentAssessments = (marks.data ?? []).slice(0, 3);
  const semester =
    dashboard.data?.currentSemester ?? student?.currentSemester ?? null;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Welcome{student ? `, ${getFirstName(student.fullName)}` : ""}</h1>
          <div className="today">{today}</div>
        </div>
        <div className="topbar-right">
          <div className="tags">
            {semester != null && <span className="tag">Semester {semester}</span>}
            {student?.currentSection && (
              <span className="tag">Section {student.currentSection}</span>
            )}
          </div>
          {student && (
            <Link className="profile" to={studentRoutes.profile}>
              <div className="avatar">{getInitials(student.fullName)}</div>
              <div>
                <div className="name">{student.fullName}</div>
                <div className="reg">{student.stdRegNumber}</div>
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="layout">
        <div className="col-main">
          <div className="card">
            <div className="card-head">
              <h2>Enrolled Subjects</h2>
              <span className="meta">{courses.length} subjects</span>
            </div>
            {dashboard.isLoading ? (
              <div className="card-body page-placeholder__todo">Loading…</div>
            ) : dashboard.isError ? (
              <div className="card-body page-placeholder__todo">
                {getErrorMessage(dashboard.error, "Failed to load subjects.")}
              </div>
            ) : (
              <div className="table-scroll">
                <table className="tbl-subjects">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="page-placeholder__todo">
                          No enrolled subjects found.
                        </td>
                      </tr>
                    ) : (
                      courses.map((course) => (
                        <tr key={course.id}>
                          <td className="code">{course.code ?? "—"}</td>
                          <td className="subj-title">{course.name ?? "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Recent Assessments</h2>
            </div>
            {marks.isLoading ? (
              <div className="card-body page-placeholder__todo">Loading…</div>
            ) : marks.isError ? (
              <div className="card-body page-placeholder__todo">
                {getErrorMessage(marks.error, "Failed to load assessments.")}
              </div>
            ) : (
              <div className="table-scroll">
                <table className="tbl-assessments">
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th className="col-hide-sm">Subject</th>
                      <th>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAssessments.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="page-placeholder__todo">
                          No assessments recorded yet.
                        </td>
                      </tr>
                    ) : (
                      recentAssessments.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="subj-title">{item.assessment}</div>
                            <div className="subj-sub col-show-sm">
                              {item.course.code}
                            </div>
                          </td>
                          <td className="subj-sub col-hide-sm">
                            {item.course.code} — {item.course.name}
                          </td>
                          <td>
                            {item.marks.obtained} / {item.marks.total}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-side">
          <div className="card">
            <div className="card-head">
              <h2>Fee Status</h2>
            </div>
            <div className="card-body">
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                Fee details are available on the Fees page.
              </div>
              <Link className="btn" to={studentRoutes.fees} style={{ marginTop: 12 }}>
                View fees
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;