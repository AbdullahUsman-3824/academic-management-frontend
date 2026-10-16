export const adminPaths = {
  root:       "/",
  dashboard:  "/",
  academics:  "/academics",
  // Academic sub-routes
  academicsYears:    "/academics/years",
  academicsSessions: "/academics/sessions",
  academicsBatches:  "/academics/batches",
  academicsSetup:    "/academics/setup",
    academicsYearNew:     "/academics/years/new",
  academicsYearView:    (id: string) => `/academics/years/${id}`,
  academicsYearEdit:    (id: string) => `/academics/years/${id}/edit`,
  academicsSessionNew:  "/academics/sessions/new",
  academicsSessionView: (id: string) => `/academics/sessions/${id}`,
  academicsSessionEdit: (id: string) => `/academics/sessions/${id}/edit`,
  academicsBatchNew:    "/academics/batches/new",
  academicsBatchView:   (id: string) => `/academics/batches/${id}`,
  academicsBatchEdit:   (id: string) => `/academics/batches/${id}/edit`,
  // Other sections
  students:     "/students",
  studentNew:   "/students/new",
  studentView:  (id: string) => `/students/${id}`,
  studentEdit:  (id: string) => `/students/${id}/edit`,
  faculty:      "/faculty",
  courses:      "/courses",
};

export const adminNavItems = [
  { label: "Dashboard",           path: adminPaths.dashboard  },
  { label: "Academic Management", path: adminPaths.academics  },
  { label: "Student Management",  path: adminPaths.students   },
  { label: "Faculty Management",  path: adminPaths.faculty    },
  { label: "Course Management",   path: adminPaths.courses    },
];
