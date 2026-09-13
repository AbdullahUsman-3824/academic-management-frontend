export const adminPaths = {
  root:      '/',
  dashboard: '/',
  academic:  '/academic',
  students:  '/students',
  faculty:   '/faculty',
  courses:   '/courses',
  academics: '/academics',
}

export const adminNavItems = [
  { label: 'Dashboard',           path: adminPaths.dashboard },
  { label: 'Academic Management', path: adminPaths.academic  },
  { label: 'Student Management',  path: adminPaths.students  },
  { label: 'Faculty Management',  path: adminPaths.faculty   },
  { label: 'Course Management',   path: adminPaths.courses   },
  { label: 'Sessions & Years',    path: adminPaths.academics },
]
