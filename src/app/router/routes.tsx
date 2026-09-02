export const studentRoutes = {
  root: "/student",
  dashboard: "/student",
  subjects: "/student/subjects",
  results: "/student/results",
  marks: "/student/marks",
  fees: "/student/fees",
  announcements: "/student/announcements",
  profile: "/student/profile",
};

export const studentNavItems = [
  { label: "Dashboard", path: studentRoutes.dashboard },
  { label: "Subjects", path: studentRoutes.subjects },
  { label: "Marks", path: studentRoutes.marks },
  { label: "Results", path: studentRoutes.results },
  { label: "Fees", path: studentRoutes.fees },
  { label: "Announcements", path: studentRoutes.announcements },
  { label: "Profile", path: studentRoutes.profile },
];