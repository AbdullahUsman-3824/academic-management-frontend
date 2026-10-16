import AdminLayout from "./components/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/student/StudentsPage";
import CreateStudentPage from "./pages/student/CreateStudentPage";
import ViewStudentPage from "./pages/student/ViewStudentPage";
import EditStudentPage from "./pages/student/EditStudentPage";
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
    { path: "students", element: <StudentsPage /> },
    { path: "students/new", element: <CreateStudentPage /> },
    { path: "students/:id", element: <ViewStudentPage /> },
    { path: "students/:id/edit", element: <EditStudentPage /> },
    { path: "faculty", element: <FacultyManagementPage /> },
    { path: "courses", element: <CoursesPage /> },
  ],
};
