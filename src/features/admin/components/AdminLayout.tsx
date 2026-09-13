import { useState, useEffect, type ReactNode } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { adminNavItems, adminPaths } from "../data/navData";
import "../../../styles/admin-portal.css";
import logo from "../../../assets/icons/law-college-logo.png";
import { useAuth } from "../../../hooks/useAuth";

import {
  DashboardRounded as DashboardIcon,
  SchoolRounded as SchoolIcon,
  PeopleAltRounded as PeopleIcon,
  BadgeRounded as BadgeIcon,
  MenuBookRounded as CoursesIcon,
  LogoutRounded as LogoutIcon,
  MenuRounded as MenuIcon,
  CloseRounded as CloseIcon,
  AssessmentRounded as AcademicIcon,
} from "@mui/icons-material";

const navIcons: Record<string, ReactNode> = {
  [adminPaths.dashboard]: <DashboardIcon fontSize="small" />,
  [adminPaths.academics]: <SchoolIcon fontSize="small" />,
  [adminPaths.students]: <PeopleIcon fontSize="small" />,
  [adminPaths.faculty]: <BadgeIcon fontSize="small" />,
  [adminPaths.courses]: <CoursesIcon fontSize="small" />,
};

function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
            style={{ objectFit: "contain", display: "block" }}
          />
        </div>
        <div>
          <div className="brand-text">
            Muhammadan Law
            <br />
            College
          </div>
          <div className="brand-sub">Admin Portal</div>
        </div>
      </div>

      <nav aria-label="Admin portal navigation">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === adminPaths.dashboard}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            {navIcons[item.path]}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="spacer" />

      {/* Admin identity chip */}
      {user && (
        <div
          style={{
            padding: "10px",
            borderRadius: "6px",
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)",
            marginBottom: "8px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            {user.username}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,.6)",
              marginTop: 2,
            }}
          >
            Administrator
          </div>
        </div>
      )}

      <button
        type="button"
        className="nav-item logout-item"
        onClick={handleLogout}
        style={{
          background: "none",
          border: "none",
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <LogoutIcon sx={{ fontSize: 22 }} />
        Log out
      </button>
    </>
  );

  return (
    <div className="admin-portal">
      {/* Mobile top bar */}
      <header className="mobile-topbar" aria-label="Mobile navigation bar">
        <div className="mobile-brand">
          <div className="mark mark--sm">
            <img
              src={logo}
              alt="Muhammadan Law College logo"
              width={32}
              height={32}
              decoding="async"
              style={{ objectFit: "contain", display: "block" }}
            />
          </div>
          <span className="mobile-brand-text">MLC Admin Portal</span>
        </div>
        <button
          className="hamburger"
          type="button"
          aria-label={
            drawerOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={drawerOpen}
          aria-controls="admin-mobile-drawer"
          onClick={() => setDrawerOpen((v) => !v)}
        >
          {drawerOpen ? (
            <CloseIcon sx={{ fontSize: 24 }} />
          ) : (
            <MenuIcon sx={{ fontSize: 24 }} />
          )}
        </button>
      </header>

      {drawerOpen && (
        <div
          className="drawer-backdrop"
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div className="shell">
        {/* Desktop sidebar */}
        <aside className="sidebar" aria-label="Admin portal sidebar">
          {sidebarContent}
        </aside>

        {/* Mobile drawer */}
        <aside
          id="admin-mobile-drawer"
          className={`sidebar sidebar--drawer${drawerOpen ? " is-open" : ""}`}
          aria-label="Admin portal navigation drawer"
          aria-hidden={!drawerOpen}
        >
          {sidebarContent}
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
