import AdminLayout from "./components/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import StudentManagementPage from "./pages/student/StudentManagementPage";
import FacultyManagementPage from "./pages/FacultyManagementPage";
import AcademicsLayout from "./pages/academics/AcademicsLayout";
import AcademicsOverviewPage from "./pages/academics/AcademicsOverviewPage";
import AcademicsYearsPage from "./pages/academics/AcademicsYearsPage";
import AcademicsSessionsPage from "./pages/academics/AcademicsSessionsPage";
import AcademicsBatchesPage from "./pages/academics/AcademicsBatchesPage";
import AcademicsSetupPage from "./pages/academics/AcademicsSetupPage";
import CoursesPage from "./pages/courses/CoursesPage";

// Route config consumed by PortalRoutes — mirrors the same shape as studentRoutes
export const adminRoutes = {
  layout: AdminLayout,
  children: [
    { index: true, element: <DashboardPage /> },
    {
      path: "academics",
      element: <AcademicsLayout />,
      children: [
        { index: true,      element: <AcademicsOverviewPage /> },
        { path: "years",    element: <AcademicsYearsPage /> },
        { path: "sessions", element: <AcademicsSessionsPage /> },
        { path: "batches",  element: <AcademicsBatchesPage /> },
        { path: "setup",    element: <AcademicsSetupPage /> },
      ],
    },
    { path: "students",  element: <StudentManagementPage /> },
    { path: "faculty",   element: <FacultyManagementPage /> },
    { path: "courses",   element: <CoursesPage /> },
  
  ],
};
