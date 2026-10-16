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
import CreateYearPage from "./pages/academics/years/CreateYearPage";
import YearDetail from "./pages/academics/years/YearDetail";
import YearEdit from "./pages/academics/years/YearEdit";
import SessionsPage from "./pages/academics/sessions/SessionsPage";
import CreateSessionPage from "./pages/academics/sessions/CreateSessionPage";
import SessionDetail from "./pages/academics/sessions/SessionDetail";
import SessionEdit from "./pages/academics/sessions/SessionEdit";
import BatchesPage from "./pages/academics/batches/BatchesPage";
import CreateBatchPage from "./pages/academics/batches/CreateBatchPage";
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
        { path: "years/new", element: <CreateYearPage /> },
        { path: "years/:id", element: <YearDetail /> },
        { path: "years/:id/edit", element: <YearEdit /> },

        { path: "sessions", element: <SessionsPage /> },
        { path: "sessions/new", element: <CreateSessionPage /> },
        { path: "sessions/:id", element: <SessionDetail /> },
        { path: "sessions/:id/edit", element: <SessionEdit /> },

        { path: "batches", element: <BatchesPage /> },
        { path: "batches/new", element: <CreateBatchPage /> },
        { path: "batches/:id", element: <BatchDetail /> },
        { path: "batches/:id/edit", element: <BatchEdit /> },

        { path: "setup", element: <AcademicsSetupPage /> },
        // ProgressionPage.tsx is fully commented out; progression runs from
        // the Sessions list (Run Progression). Keep Overview links from 404ing.
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