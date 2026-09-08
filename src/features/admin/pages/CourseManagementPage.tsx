import { useState } from 'react'
import { courses, type Course } from '../data/mockAdmin'

function CourseDetail({ course, onBack }: { course: Course; onBack: () => void }) {
  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="btn secondary" onClick={onBack}>
            ← Back
          </button>
          <div>
            <h1 style={{ marginBottom: 2 }}>{course.title}</h1>
            <div className="today">{course.code} · {course.creditHours} credit hrs</div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card">
          <div className="card-head"><h2>Course Details</h2></div>
          <div className="profile-fields">
            {[
              { label: 'Course Code',   value: course.code },
              { label: 'Title',         value: course.title },
              { label: 'Credit Hours',  value: String(course.creditHours) },
              { label: 'Prerequisite',  value: course.prerequisite ?? 'None' },
              { label: 'Description',   value: course.description },
            ].map((f) => (
              <div className="profile-field" key={f.label}>
                <div className="profile-field__label">{f.label}</div>
                <div className="profile-field__value">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-head"><h2>Assigned Faculty</h2></div>
            <div className="card-body">
              {course.assignedFaculty ? (
                <span className="subj-title">{course.assignedFaculty}</span>
              ) : (
                <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                  No faculty assigned
                </span>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Assigned Sections</h2>
              <span className="meta">{course.assignedSections.length} section{course.assignedSections.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="card-body">
              {course.assignedSections.length === 0 ? (
                <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                  Not assigned to any section yet.
                </span>
              ) : (
                <div className="chip-list">
                  {course.assignedSections.map((s) => (
                    <span key={s} className="chip">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function CourseManagementPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? courses.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.title.toLowerCase().includes(search.toLowerCase()),
      )
    : courses

  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Course Management</h1>
          <div className="today">
            Create/edit courses, manage credit hours &amp; prerequisites, and assign faculty and sections.
          </div>
        </div>
        <button type="button" className="btn">+ Add Course</button>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="meta">{courses.length} courses total · {filtered.length} shown</span>
          {/* Inline search */}
          <input
            type="search"
            placeholder="Search code or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 5,
              border: '1px solid var(--line)',
              fontSize: 13,
              outline: 'none',
              width: 200,
            }}
            aria-label="Search courses"
          />
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Credits</th>
                <th className="col-hide-sm">Prerequisite</th>
                <th className="col-hide-sm">Faculty</th>
                <th>Sections</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="code">{c.code}</td>
                  <td>
                    <div className="subj-title">{c.title}</div>
                    <div className="subj-sub col-show-sm">{c.creditHours} cr</div>
                  </td>
                  <td>
                    <span className="credit-pill">{c.creditHours} cr</span>
                  </td>
                  <td className="subj-sub col-hide-sm">
                    {c.prerequisite ?? <span style={{ color: 'var(--ink-faint)' }}>—</span>}
                  </td>
                  <td className="subj-sub col-hide-sm">
                    {c.assignedFaculty ?? (
                      <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    {c.assignedSections.length === 0 ? (
                      <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>None</span>
                    ) : (
                      <span className="credit-pill">{c.assignedSections.length}</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => setSelectedCourse(c)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                    No courses match your search.
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

export default CourseManagementPage
