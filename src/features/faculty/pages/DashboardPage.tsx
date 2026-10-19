import { useNavigate } from 'react-router-dom'
import { useFacultyProfile, useFacultyTeachingLoad } from '../hooks/useFacultyQueries'
import PersonIcon from '@mui/icons-material/Person'
import BadgeIcon from '@mui/icons-material/Badge'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SchoolIcon from '@mui/icons-material/School'
import GroupsIcon from '@mui/icons-material/Groups'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

function DashboardPage() {
  const navigate = useNavigate()
  const { data: faculty, isLoading: loadingProfile } = useFacultyProfile()
  const { data: teachingLoad, isLoading: loadingTeachingLoad } = useFacultyTeachingLoad()

  const isLoading = loadingProfile || loadingTeachingLoad

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
        Loading...
      </div>
    )
  }

  const getFullName = () => {
    if (!faculty) return 'Faculty Member'
    return `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim() || 'Faculty Member'
  }

  return (
    <>
      {/* Welcome Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e6b3e 0%, #2d8f57 100%)',
          padding: '32px 40px',
          borderRadius: 12,
          marginBottom: 24,
          color: 'white',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, marginBottom: 8, color: 'white' }}>
          Welcome back, {getFullName()}!
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 15, opacity: 0.95 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PersonIcon sx={{ fontSize: 18 }} />
            {faculty?.designation || 'Faculty'}
          </span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BadgeIcon sx={{ fontSize: 18 }} />
            {faculty?.employeeNumber || ''}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div
          style={{
            background: 'white',
            padding: 24,
            borderRadius: 12,
            border: '1px solid var(--line)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 10, 
              background: '#e8f5e9', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <MenuBookIcon sx={{ fontSize: 22, color: '#2d8f57' }} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-faint)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Courses
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1e6b3e', lineHeight: 1 }}>
            {teachingLoad?.totalCourses || 0}
          </div>
        </div>
        
        <div
          style={{
            background: 'white',
            padding: 24,
            borderRadius: 12,
            border: '1px solid var(--line)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 10, 
              background: '#e3f2fd', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <SchoolIcon sx={{ fontSize: 22, color: '#1976d2' }} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-faint)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Credit Hours
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1976d2', lineHeight: 1 }}>
            {teachingLoad?.totalCreditHours || 0}
          </div>
        </div>
        
        <div
          style={{
            background: 'white',
            padding: 24,
            borderRadius: 12,
            border: '1px solid var(--line)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 10, 
              background: '#fff3e0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <GroupsIcon sx={{ fontSize: 22, color: '#f57c00' }} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-faint)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sections Teaching
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#f57c00', lineHeight: 1 }}>
            {teachingLoad?.allocations.length || 0}
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2 style={{ marginBottom: 4 }}>My Courses</h2>
            <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}>Current Academic Session</span>
          </div>
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate('/courses')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            View All <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {!teachingLoad || teachingLoad.allocations.length === 0 ? (
          <div className="card-body">
            <div style={{ textAlign: 'center', padding: 40 }}>
              <MenuBookIcon sx={{ fontSize: 64, color: '#e0e0e0', marginBottom: 2 }} />
              <p style={{ color: 'var(--ink-faint)', margin: 0, fontSize: 15 }}>
                No courses assigned for this semester.
              </p>
              <p style={{ color: 'var(--ink-faint)', margin: '8px 0 0', fontSize: 13 }}>
                Contact the admin if you believe this is an error.
              </p>
            </div>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Course Code</th>
                  <th>Course Name</th>
                  <th className="col-hide-sm" style={{ width: 100 }}>Section</th>
                  <th className="col-hide-sm" style={{ width: 100 }}>Batch</th>
                  <th style={{ width: 100 }}>Credits</th>
                  <th className="col-hide-sm" style={{ width: 120 }}>Semester</th>
                </tr>
              </thead>
              <tbody>
                {teachingLoad.allocations.slice(0, 5).map((allocation) => (
                  <tr 
                    key={allocation.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/courses/${allocation.id}`)}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e6b3e' }}>{allocation.course.code}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{allocation.course.name}</div>
                      <div className="col-show-sm" style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>
                        {allocation.section.name} · {allocation.section.batch.name} · Sem {allocation.semesterNumber}
                      </div>
                    </td>
                    <td className="col-hide-sm">
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: '#f0f4f8',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 500,
                      }}>
                        {allocation.section.name}
                      </span>
                    </td>
                    <td className="col-hide-sm">
                      <span style={{ fontSize: 14, color: 'var(--ink-faint)' }}>
                        {allocation.section.batch.name}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 10px',
                        background: '#e8f5e9',
                        color: '#2d8f57',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                      }}>
                        {allocation.course.creditHours} cr
                      </span>
                    </td>
                    <td className="col-hide-sm">
                      <span style={{ fontSize: 14, color: 'var(--ink-faint)' }}>
                        Semester {allocation.semesterNumber}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {teachingLoad && teachingLoad.allocations.length > 5 && (
          <div style={{ 
            padding: '16px 20px', 
            borderTop: '1px solid var(--line)', 
            textAlign: 'center',
            background: '#fafafa'
          }}>
            <button
              type="button"
              className="btn secondary small"
              onClick={() => navigate('/courses')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              View All {teachingLoad.allocations.length} Courses <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default DashboardPage
