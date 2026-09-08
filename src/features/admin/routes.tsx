import AdminLayout from './components/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import AcademicManagementPage from './pages/AcademicManagementPage'
import StudentManagementPage from './pages/StudentManagementPage'
import FacultyManagementPage from './pages/FacultyManagementPage'
import CourseManagementPage from './pages/CourseManagementPage'

// Route config consumed by PortalRoutes — mirrors the same shape as studentRoutes
export const adminRoutes = {
  layout: AdminLayout,
  children: [
    { index: true,           element: <DashboardPage /> },
    { path: 'academic',      element: <AcademicManagementPage /> },
    { path: 'students',      element: <StudentManagementPage /> },
    { path: 'faculty',       element: <FacultyManagementPage /> },
    { path: 'courses',       element: <CourseManagementPage /> },
  ],
}
