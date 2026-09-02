import { useState, useEffect, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { studentNavItems, studentRoutes } from "../data/navData";
import { student } from "../data/mockStudent";
import "../../../styles/student-portal.css";
import logo from "../../../assets/icons/law-college-logo.png";

import {
  DashboardRounded as DashboardIcon,
  MenuBookRounded as MenuBookIcon,
  AssignmentRounded as AssignmentIcon,
  BarChartRounded as BarChartIcon,
  ReceiptLongRounded as ReceiptLongIcon,
  CampaignRounded as CampaignIcon,
  PersonRounded as PersonIcon,
  LogoutRounded as LogoutIcon,
  MenuRounded as MenuIcon,
  CloseRounded as CloseIcon,
} from "@mui/icons-material";

const navIcons: Record<string, ReactNode> = {
  [studentRoutes.dashboard]: <DashboardIcon fontSize="small" />,
  [studentRoutes.subjects]: <MenuBookIcon fontSize="small" />,
  [studentRoutes.marks]: <AssignmentIcon fontSize="small" />,
  [studentRoutes.results]: <BarChartIcon fontSize="small" />,
  [studentRoutes.fees]: <ReceiptLongIcon fontSize="small" />,
  [studentRoutes.announcements]: <CampaignIcon fontSize="small" />,
  [studentRoutes.profile]: <PersonIcon fontSize="small" />,
};

function StudentLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

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
          <div className="brand-sub">Student Portal</div>
        </div>
      </div>

      <nav aria-label="Student portal navigation">
        {studentNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
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
          className={({ isActive }) =>
            `sidebar-profile${isActive ? " active" : ""}`
          }
        >
          <div className="sidebar-profile__avatar">{student.initials}</div>
          <div className="sidebar-profile__info">
            <div className="sidebar-profile__name">{student.name}</div>
            <div className="sidebar-profile__reg">{student.regNo}</div>
          </div>
        </NavLink>
      )}

      <a className="nav-item logout-item" href="#">
        <LogoutIcon sx={{ fontSize: 22 }} />
        Log out
      </a>
    </>
  );

  return (
    <div className="student-portal">
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
          <span className="mobile-brand-text">MLC Student Portal</span>
        </div>
        <button
          className="hamburger"
          type="button"
          aria-label={
            drawerOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
          onClick={() => setDrawerOpen((v) => !v)}
        >
          {drawerOpen ? (
            <CloseIcon sx={{ fontSize: 24 }} />
          ) : (
            <MenuIcon sx={{ fontSize: 24 }} />
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
          className={`sidebar sidebar--drawer${drawerOpen ? " is-open" : ""}`}
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
  );
}

export default StudentLayout;
