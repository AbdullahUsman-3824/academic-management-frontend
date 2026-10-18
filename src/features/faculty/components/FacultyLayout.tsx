import { useState, useEffect, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { facultyNavItems, facultyPaths } from '../data/navData'
import { useFacultyProfile } from '../hooks/useFacultyQueries'
import { useAuth } from '../../../hooks/useAuth'
import '../../../styles/student-portal.css'
import logo from '../../../assets/icons/law-college-logo.png'

import {
  DashboardRounded as DashboardIcon,
  MenuBookRounded as MenuBookIcon,
  PersonRounded as PersonIcon,
  LogoutRounded as LogoutIcon,
  MenuRounded as MenuIcon,
  CloseRounded as CloseIcon,
} from '@mui/icons-material'

const navIcons: Record<string, ReactNode> = {
  [facultyPaths.dashboard]: <DashboardIcon fontSize="small" />,
  [facultyPaths.courses]: <MenuBookIcon fontSize="small" />,
  [facultyPaths.profile]: <PersonIcon fontSize="small" />,
}

function FacultyLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { data: faculty, isLoading } = useFacultyProfile()
  const { logout } = useAuth()

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = () => {
    if (!faculty) return 'F'
    const first = faculty.firstName?.[0] || ''
    const last = faculty.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'F'
  }

  const getFullName = () => {
    if (!faculty) return 'Faculty'
    return `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim() || 'Faculty'
  }

  const sidebarContent = (
    <>
      <div className="brand">
        <div className="mark">
          <img
            src={logo}
            alt="Muhammadan Law College logo"
            width={48}
            height={48}
            decoding="async"
            style={{ objectFit: 'contain', display: 'block' }}
          />
        </div>
        <div>
          <div className="brand-text">
            Muhammadan Law
            <br />
            College
          </div>
          <div className="brand-sub">Faculty Portal</div>
        </div>
      </div>

      <nav aria-label="Faculty portal navigation">
        {facultyNavItems.map((item) => (
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

      <NavLink
        to={facultyPaths.profile}
        className={({ isActive }) => `sidebar-profile${isActive ? ' active' : ''}`}
      >
        <div
          className="avatar"
          style={{
            background: 'var(--green-900)',
            color: '#fff',
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {getInitials()}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="profile-name">{getFullName()}</div>
          <div className="profile-role">{faculty?.employeeNumber || ''}</div>
        </div>
      </NavLink>

      <button className="nav-item logout-item" onClick={handleLogout}>
        <LogoutIcon fontSize="small" />
        Log out
      </button>
    </>
  )

  return (
    <div className="student-portal">
      <div className="shell">
        {/* Sidebar */}
        <aside className="sidebar">{sidebarContent}</aside>

        {/* Main content */}
        <main className="portal-main">
          {/* Mobile topbar */}
          <div className="mobile-topbar">
            <button
              type="button"
              className="menu-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
            <div className="mobile-brand">
              <img src={logo} alt="Logo" width={32} height={32} />
              <span>Faculty Portal</span>
            </div>
            <div style={{ width: 40 }} />
          </div>

          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
              Loading...
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}

      {/* Mobile drawer */}
      <aside className={`drawer${drawerOpen ? ' open' : ''}`}>
        <button
          type="button"
          className="drawer-close"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
        {sidebarContent}
      </aside>
    </div>
  )
}

export default FacultyLayout
