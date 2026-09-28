import AdminLayout from "./components/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import StudentManagementPage from "./pages/student/StudentManagementPage";
import FacultyManagementPage from "./pages/FacultyManagementPage";
import AcademicsLayout from "./pages/academics/AcademicsLayout";
import OverviewPage from "./pages/academics/OverviewPage";
import YearsPage from './pages/academics/YearsPage'
import SessionsPage from './pages/academics/SessionsPage'
import BatchesPage from './pages/academics/BatchesPage'
import ProgressionPage from './pages/academics/ProgressionPage'
import SectionsPage from './pages/academics/SectionsPage'
import AcademicsSetupPage from './pages/academics/AcademicsSetupPage'
import CoursesPage from "./pages/courses/CoursesPage";

// Route config consumed by PortalRoutes — mirrors the same shape as studentRoutes
export const adminRoutes = {
  layout: AdminLayout,
  children: [
    { index: true, element: <DashboardPage /> },
    {
  path: 'academics',
  element: <AcademicsLayout />,
  children: [
    { index: true, element: <OverviewPage /> },
    { path: 'years', element: <YearsPage /> },
    { path: 'sessions', element: <SessionsPage /> },
    { path: 'batches', element: <BatchesPage /> },
    { path: 'progression', element: <ProgressionPage /> },
    { path: 'sections', element: <SectionsPage /> },
    { path: 'setup', element: <AcademicsSetupPage /> },
  ],
},
    { path: "students",  element: <StudentManagementPage /> },
    { path: "faculty",   element: <FacultyManagementPage /> },
    { path: "courses",   element: <CoursesPage /> },
  ],
};
