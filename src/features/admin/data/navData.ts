export const adminPaths = {
  root:       "/",
  dashboard:  "/",
  academics:  "/academics",
  // Academic sub-routes
  academicsYears:    "/academics/years",
  academicsSessions: "/academics/sessions",
  academicsBatches:  "/academics/batches",
  academicsSetup:    "/academics/setup",
  // Other sections
  students: "/students",
  faculty:  "/faculty",
  courses:  "/courses",
};

export const adminNavItems = [
  { label: "Dashboard",           path: adminPaths.dashboard  },
  { label: "Academic Management", path: adminPaths.academics  },
  { label: "Student Management",  path: adminPaths.students   },
  { label: "Faculty Management",  path: adminPaths.faculty    },
  { label: "Course Management",   path: adminPaths.courses    },
];
