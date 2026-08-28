import { useState, useEffect, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { studentNavItems, studentRoutes } from '../../../app/router/routes'
import { student } from '../data/mockStudent'
import '../../../styles/student-portal.css'

const navIcons: Record<string, ReactNode> = {
  [studentRoutes.dashboard]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="11" width="8" height="10" rx="1.5" />
      <rect x="3" y="14" width="8" height="7" rx="1.5" />
    </svg>
  ),
  [studentRoutes.subjects]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H14v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13Z" />
      <path d="M14 4h4.5c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5H14" />
    </svg>
  ),
  [studentRoutes.marks]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="1.6" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  [studentRoutes.results]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  ),
  [studentRoutes.fees]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="1.6" />
      <path d="M3 10h18M7 3v4" />
    </svg>
  ),
  [studentRoutes.announcements]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
  [studentRoutes.profile]: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
}
function StudentLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const sidebarContent = (
    <>
      <div className="brand">
        <div className="mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0F5C3E" strokeWidth="1.6" aria-hidden="true">
            <path d="M12 3v18M4 8l8-4 8 4M4 8l-1.5 5h5L6 8M20 8l1.5 5h-5L18 8M4 13a2.5 2.5 0 0 0 5 0M15 13a2.5 2.5 0 0 0 5 0" />
          </svg>
        </div>
        <div>
          <div className="brand-text">Muhammadan Law<br />College</div>
          <div className="brand-sub">Student Portal</div>
        </div>
      </div>

      <nav aria-label="Student portal navigation">
        {studentNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {navIcons[item.path]}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="spacer" />

      {location.pathname !== studentRoutes.dashboard && (
        <NavLink
          to={studentRoutes.profile}
          className={({ isActive }) => `sidebar-profile${isActive ? ' active' : ''}`}
        >
          <div className="sidebar-profile__avatar">{student.initials}</div>
          <div className="sidebar-profile__info">
            <div className="sidebar-profile__name">{student.name}</div>
            <div className="sidebar-profile__reg">{student.regNo}</div>
          </div>
        </NavLink>
      )}

      <a className="nav-item logout-item" href="#">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9M16 17l5-5-5-5M21 12H9" />
        </svg>
        Log out
      </a>
    </>
  )

  return (
    <div className="student-portal">
      {/* Mobile top bar — only visible on small screens */}
      <header className="mobile-topbar" aria-label="Mobile navigation bar">
        <div className="mobile-brand">
          <div className="mark mark--sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0F5C3E" strokeWidth="1.6" aria-hidden="true">
              <path d="M12 3v18M4 8l8-4 8 4M4 8l-1.5 5h5L6 8M20 8l1.5 5h-5L18 8M4 13a2.5 2.5 0 0 0 5 0M15 13a2.5 2.5 0 0 0 5 0" />
            </svg>
          </div>
          <span className="mobile-brand-text">MLC Student Portal</span>
        </div>
        <button
          className="hamburger"
          type="button"
          aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
          onClick={() => setDrawerOpen((v) => !v)}
        >
          {drawerOpen ? (
            // X icon
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
      </header>

      {/* Backdrop — closes drawer when tapped */}
      {drawerOpen && (
        <div
          className="drawer-backdrop"
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div className="shell">
        {/* Desktop sidebar — always visible ≥769px */}
        <aside className="sidebar" aria-label="Student portal sidebar">
          {sidebarContent}
        </aside>

        {/* Mobile drawer — slides in from left */}
        <aside
          id="mobile-drawer"
          className={`sidebar sidebar--drawer${drawerOpen ? ' is-open' : ''}`}
          aria-label="Student portal navigation drawer"
          aria-hidden={!drawerOpen}
        >
          {sidebarContent}
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default StudentLayout
