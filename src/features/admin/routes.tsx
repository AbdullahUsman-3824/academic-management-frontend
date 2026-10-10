import AdminLayout from "./components/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import StudentManagementPage from "./pages/student/StudentManagementPage";
import FacultyManagementPage from "./pages/FacultyManagementPage";
import AcademicsLayout from "./pages/academics/AcademicsLayout";
import OverviewPage from "./pages/academics/OverviewPage";
import YearsPage from "./pages/academics/YearsPage";
import AcademicsSessionsPage from "./pages/academics/sessions/SessionsPage";
import BatchesPage from "./pages/academics/BatchesPage";
import AcademicsSetupPage from "./pages/academics/AcademicsSetupPage";
import CoursesPage from "./pages/courses/CoursesPage";

export const adminRoutes = {
  layout: AdminLayout,
  children: [
    { index: true, element: <DashboardPage /> },
    {
      path: "academics",
      element: <AcademicsLayout />,
      children: [
        { index: true, element: <OverviewPage /> },
        { path: "years", element: <YearsPage /> },
        { path: "sessions", element: <AcademicsSessionsPage /> },
        { path: "batches", element: <BatchesPage /> },
        { path: "setup", element: <AcademicsSetupPage /> },
      ],
    },
    { path: "students", element: <StudentManagementPage /> },
    { path: "faculty", element: <FacultyManagementPage /> },
    { path: "courses", element: <CoursesPage /> },
  ],
};
