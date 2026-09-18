import { NavLink, useLocation } from "react-router-dom";

export interface AcademicNavTab {
  label: string;
  to: string;
  /** exact match — use true for the index/overview tab */
  end?: boolean;
}

interface Props {
  tabs: AcademicNavTab[];
}

/**
 * Route-driven underline navigation tabs for the Academic Management section.
 * Active state is derived from the current URL, not component state.
 */
export function AcademicNavTabs({ tabs }: Props) {
  const { pathname } = useLocation();

  return (
    <nav className="acad-nav-tabs" aria-label="Academic sections">
      {tabs.map(({ label, to, end }) => {
        // Determine active: for the overview tab (end=true) match exact,
        // for others match prefix so child routes also stay highlighted.
        const isActive = end
          ? pathname === to || pathname === to + "/"
          : pathname.startsWith(to);

        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={`acad-nav-tab${isActive ? " acad-nav-tab--active" : ""}`}
          >
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}
