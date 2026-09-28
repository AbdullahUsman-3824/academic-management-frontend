import { Outlet } from 'react-router-dom'
import { AcademicNavTabs } from '../../components/AcademicNavTabs'
import { adminPaths } from '../../data/navData'

const academicTabs = [
  { label: 'Overview',     to: adminPaths.academics,              end: true },
  { label: 'Years',        to: `${adminPaths.academics}/years` },
  { label: 'Sessions',     to: `${adminPaths.academics}/sessions` },
  { label: 'Batches',      to: `${adminPaths.academics}/batches` },
  { label: 'Progression',  to: `${adminPaths.academics}/progression` },
  { label: 'Sections',     to: `${adminPaths.academics}/sections` },
]

export default function AcademicsLayout() {
  return (
    <>
      <div className="topbar">
        <div>
          <h1>Academic Management</h1>
          <div className="today">
            Years, sessions, batches, progression, and section administration.
          </div>
        </div>
      </div>

      <div className="card">
        <AcademicNavTabs tabs={academicTabs} />
        <Outlet />
      </div>
    </>
  )
}