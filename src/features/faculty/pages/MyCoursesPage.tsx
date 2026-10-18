import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacultyTeachingLoad } from '../hooks/useFacultyQueries'

export default function MyCoursesPage() {
  const navigate = useNavigate()
  const { data: teachingLoad, isLoading } = useFacultyTeachingLoad()
  const [search, setSearch] = useState('')

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
        Loading courses...
      </div>
    )
  }

  const filtered = teachingLoad?.allocations.filter((allocation) => {
    const searchLower = search.toLowerCase()
    return (
      allocation.course.code.toLowerCase().includes(searchLower) ||
      allocation.course.name.toLowerCase().includes(searchLower) ||
      allocation.section.name.toLowerCase().includes(searchLower) ||
      allocation.section.batch.name.toLowerCase().includes(searchLower)
    )
  })

  return (
    <>
      <div className="topbar">
        <div>
          <h1>My Courses</h1>
          <div className="today">
            {filtered?.length || 0} course{(filtered?.length || 0) !== 1 ? 's' : ''} assigned
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-head">
          <input
            type="search"
            placeholder="Search courses by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        {!filtered || filtered.length === 0 ? (
          <div className="card-body">
            <p style={{ color: 'var(--ink-faint)', margin: 0, textAlign: 'center', padding: 20 }}>
              {search ? 'No courses match your search.' : 'No courses assigned for this semester.'}
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th className="col-hide-sm">Section</th>
                  <th className="col-hide-sm">Batch</th>
                  <th>Credits</th>
                  <th className="col-hide-sm">Semester</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((allocation) => (
                  <tr key={allocation.id}>
                    <td>
                      <div className="subj-title">{allocation.course.code}</div>
                    </td>
                    <td>
                      <div className="subj-title">{allocation.course.name}</div>
                      <div className="subj-sub col-show-sm">
                        {allocation.section.name} · {allocation.section.batch.name} · Sem{' '}
                        {allocation.semesterNumber}
                      </div>
                    </td>
                    <td className="col-hide-sm">
                      <span className="subj-sub">{allocation.section.name}</span>
                    </td>
                    <td className="col-hide-sm">
                      <span className="subj-sub">{allocation.section.batch.name}</span>
                    </td>
                    <td>
                      <span className="credit-pill">{allocation.course.creditHours} cr</span>
                    </td>
                    <td className="col-hide-sm">
                      <span className="subj-sub">Semester {allocation.semesterNumber}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => navigate(`/courses/${allocation.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
