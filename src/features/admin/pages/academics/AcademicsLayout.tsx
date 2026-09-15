import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AcademicNavTabs } from "../../components/AcademicNavTabs";

const TABS = [
  { label: "Overview",  to: "/academics",          end: true  },
  { label: "Years",     to: "/academics/years",     end: false },
  { label: "Sessions",  to: "/academics/sessions",  end: false },
  { label: "Batches",   to: "/academics/batches",   end: false },
];

/**
 * Shared layout for all /academics/* routes.
 *
 * - Renders the page header with the global "+ Set Up New Academic Year"
 *   action (hidden when already on the setup page).
 * - Renders the underline nav tabs (also hidden on the setup page).
 * - Delegates content to the matched child route via <Outlet />.
 */
export default function AcademicsLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isSetupPage =
    pathname === "/academics/setup" || pathname === "/academics/setup/";

  return (
    <>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="topbar">
        <div>
          <h1>Academic Management</h1>
          <div className="today">
            Academic years, sessions, batches, and setup.
          </div>
        </div>

        {!isSetupPage && (
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/academics/setup")}
          >
            + Set Up New Academic Year
          </button>
        )}
      </div>

      {/* ── Tab card (hidden on setup page) ─────────────────── */}
      {!isSetupPage ? (
        <div className="card acad-layout-card">
          <AcademicNavTabs tabs={TABS} />
          <div className="acad-tab-content">
            <Outlet />
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
}
