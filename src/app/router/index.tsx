import { createBrowserRouter } from 'react-router-dom'
import {
  StudentLayout,
  DashboardPage,
  SubjectsPage,
  ResultsPage,
  MarksPage,
  FeesPage,
  AnnouncementsPage,
  ProfilePage,
} from '../../features/student'
import { studentRoutes } from './routes'

export const router = createBrowserRouter([
  {
    path: studentRoutes.root,
    element: <StudentLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'subjects', element: <SubjectsPage /> },
      { path: 'results', element: <ResultsPage /> },
      { path: 'marks', element: <MarksPage /> },
      { path: 'fees', element: <FeesPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
])
