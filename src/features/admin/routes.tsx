import { Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/student/StudentsPage";
import CreateStudentPage from "./pages/student/CreateStudentPage";
import ViewStudentPage from "./pages/student/ViewStudentPage";
import EditStudentPage from "./pages/student/EditStudentPage";
import FacultyManagementPage from "./pages/FacultyManagementPage";
import AcademicsLayout from "./pages/academics/AcademicsLayout";
import OverviewPage from "./pages/academics/OverviewPage";
import YearsPage from "./pages/academics/years/YearsPage";
import YearEdit from "./pages/academics/years/YearEdit";
import SessionsPage from "./pages/academics/sessions/SessionsPage";
import SessionEdit from "./pages/academics/sessions/SessionEdit";
import BatchesPage from "./pages/academics/batches/BatchesPage";
import BatchDetail from "./pages/academics/batches/BatchDetail";
import BatchEdit from "./pages/academics/batches/BatchEdit";
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
        { path: "years/:id/edit", element: <YearEdit /> },

        { path: "sessions", element: <SessionsPage /> },
        { path: "sessions/:id/edit", element: <SessionEdit /> },

        { path: "batches", element: <BatchesPage /> },
        { path: "batches/:id", element: <BatchDetail /> },
        { path: "batches/:id/edit", element: <BatchEdit /> },

        { path: "setup", element: <AcademicsSetupPage /> },
        { path: "progression", element: <Navigate to="../sessions" replace /> },
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
