import {
  StudentLayout,
  DashboardPage,
  SubjectsPage,
  ResultsPage,
  MarksPage,
  FeesPage,
  AnnouncementsPage,
  ProfilePage,
} from "./index";

export const studentRoutes = {
  root: "/",
  layout: StudentLayout,
  children: [
    { index: true, element: <DashboardPage /> },
    { path: "subjects", element: <SubjectsPage /> },
    { path: "results", element: <ResultsPage /> },
    { path: "marks", element: <MarksPage /> },
    { path: "fees", element: <FeesPage /> },
    { path: "announcements", element: <AnnouncementsPage /> },
    { path: "profile", element: <ProfilePage /> },
  ],
};
