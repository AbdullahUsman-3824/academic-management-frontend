import {
  FacultyLayout,
  DashboardPage,
  ProfilePage,
  MyCoursesPage,
  CourseDetailPage,
  AssessmentsPage,
  MarksEntryPage,
} from './index'

export const facultyRoutes = {
  root: '/',
  layout: FacultyLayout,
  children: [
    { index: true, element: <DashboardPage /> },
    { path: 'profile', element: <ProfilePage /> },
    { path: 'courses', element: <MyCoursesPage /> },
    { path: 'courses/:allocationId', element: <CourseDetailPage /> },
    { path: 'courses/:allocationId/assessments', element: <AssessmentsPage /> },
    { path: 'assessments/:assessmentId/marks', element: <MarksEntryPage /> },
  ],
}
