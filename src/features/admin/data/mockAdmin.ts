export const institutionKPIs = {
  totalStudents: 1_240,
  activeStudents: 1_108,
  facultyCount: 42,
  currentSession: '2025–2026',
  currentSemester: 'Semester 3 (Fall 2026)',
  feeCollectedThisSemester: 'Rs. 1,84,50,000',
  feePendingThisSemester: 'Rs. 24,80,000',
  feeCollectionRate: '88%',
  totalSections: 18,
  totalCourses: 34,
}

export const dashboardStats = [
  { label: 'Total Students',     value: '1,240'       },
  { label: 'Active Students',    value: '1,108'       },
  { label: 'Faculty Members',    value: '42'          },
  { label: 'Sections',           value: '18'          },
  { label: 'Courses Offered',    value: '34'          },
  { label: 'Fee Collection Rate',value: '88%'         },
]

export const recentAdminActivity = [
  { action: 'Result finalized',   detail: 'Semester 2 — Section A',           date: '01 Sep 2026' },
  { action: 'Student registered', detail: 'Zara Malik — MLC-LLB-26-089',      date: '30 Aug 2026' },
  { action: 'Faculty added',      detail: 'Mr. Kamran Siddiqui — Lect.',       date: '28 Aug 2026' },
  { action: 'Course assigned',    detail: 'LAW-401 → Ms. Farah Qureshi',       date: '27 Aug 2026' },
  { action: 'Section created',    detail: 'Section C — Semester 3',            date: '25 Aug 2026' },
]

// ---------------------------------------------------------------------------
// Academic Management  
// ---------------------------------------------------------------------------

export type SemesterStatus = 'active' | 'upcoming' | 'completed'

export interface Semester {
  id: string
  label: string
  session: string
  startDate: string
  endDate: string
  status: SemesterStatus
  isCurrent: boolean
  sections: number
}

export const semesters: Semester[] = [
  { id: 'sem1', label: 'Semester 1', session: '2024–2025', startDate: '01 Sep 2024', endDate: '31 Jan 2025', status: 'completed', isCurrent: false, sections: 3 },
  { id: 'sem2', label: 'Semester 2', session: '2024–2025', startDate: '01 Feb 2025', endDate: '30 Jun 2025', status: 'completed', isCurrent: false, sections: 3 },
  { id: 'sem3', label: 'Semester 3', session: '2025–2026', startDate: '01 Sep 2025', endDate: '31 Jan 2026', status: 'completed', isCurrent: false, sections: 4 },
  { id: 'sem4', label: 'Semester 4', session: '2025–2026', startDate: '01 Feb 2026', endDate: '30 Jun 2026', status: 'completed', isCurrent: false, sections: 4 },
  { id: 'sem5', label: 'Semester 5', session: '2026–2027', startDate: '01 Sep 2026', endDate: '31 Jan 2027', status: 'active',    isCurrent: true,  sections: 4 },
  { id: 'sem6', label: 'Semester 6', session: '2026–2027', startDate: '01 Feb 2027', endDate: '30 Jun 2027', status: 'upcoming',  isCurrent: false, sections: 0 },
]

export type SectionStatus = 'active' | 'inactive' | 'closed'

export interface Section {
  id: string
  name: string
  semesterId: string
  semesterLabel: string
  shift: 'Morning' | 'Evening'
  enrolledStudents: number
  capacity: number
  status: SectionStatus
  subjects: string[]
}

export const sections: Section[] = [
  { id: 'sec-5a', name: 'Section A', semesterId: 'sem5', semesterLabel: 'Semester 5', shift: 'Morning', enrolledStudents: 52, capacity: 60, status: 'active',   subjects: ['LAW-501','LAW-510','LAW-520','LAW-530'] },
  { id: 'sec-5b', name: 'Section B', semesterId: 'sem5', semesterLabel: 'Semester 5', shift: 'Morning', enrolledStudents: 49, capacity: 60, status: 'active',   subjects: ['LAW-501','LAW-510','LAW-520','LAW-530'] },
  { id: 'sec-5c', name: 'Section C', semesterId: 'sem5', semesterLabel: 'Semester 5', shift: 'Evening', enrolledStudents: 44, capacity: 60, status: 'active',   subjects: ['LAW-501','LAW-510','LAW-520','LAW-530'] },
  { id: 'sec-5d', name: 'Section D', semesterId: 'sem5', semesterLabel: 'Semester 5', shift: 'Evening', enrolledStudents: 38, capacity: 60, status: 'active',   subjects: ['LAW-501','LAW-510','LAW-520','LAW-530'] },
  { id: 'sec-3a', name: 'Section A', semesterId: 'sem3', semesterLabel: 'Semester 3', shift: 'Morning', enrolledStudents: 58, capacity: 60, status: 'closed',   subjects: ['LAW-301','LAW-312','LAW-320','LAW-305','LAW-330'] },
  { id: 'sec-3b', name: 'Section B', semesterId: 'sem3', semesterLabel: 'Semester 3', shift: 'Morning', enrolledStudents: 55, capacity: 60, status: 'closed',   subjects: ['LAW-301','LAW-312','LAW-320','LAW-305','LAW-330'] },
]

export type ResultReviewStatus = 'pending' | 'submitted' | 'finalized'

export interface ResultReview {
  id: string
  semesterLabel: string
  sectionName: string
  subject: string
  faculty: string
  submittedDate: string
  status: ResultReviewStatus
}

export const resultReviews: ResultReview[] = [
  { id: 'rr1', semesterLabel: 'Semester 5', sectionName: 'Section A', subject: 'LAW-501 — Administrative Law',   faculty: 'Prof. Dr. Imran Sheikh',   submittedDate: '28 Aug 2026', status: 'submitted'  },
  { id: 'rr2', semesterLabel: 'Semester 5', sectionName: 'Section A', subject: 'LAW-510 — Family Law',           faculty: 'Ms. Farah Qureshi',        submittedDate: '29 Aug 2026', status: 'submitted'  },
  { id: 'rr3', semesterLabel: 'Semester 5', sectionName: 'Section B', subject: 'LAW-501 — Administrative Law',   faculty: 'Prof. Dr. Imran Sheikh',   submittedDate: '—',           status: 'pending'    },
  { id: 'rr4', semesterLabel: 'Semester 5', sectionName: 'Section B', subject: 'LAW-520 — Evidence Law',         faculty: 'Mr. Bilal Hashmi',         submittedDate: '—',           status: 'pending'    },
  { id: 'rr5', semesterLabel: 'Semester 3', sectionName: 'Section A', subject: 'LAW-301 — Law of Contract',      faculty: 'Assist. Prof. S. Rai Anwar',submittedDate: '20 Feb 2026', status: 'finalized'  },
  { id: 'rr6', semesterLabel: 'Semester 3', sectionName: 'Section B', subject: 'LAW-312 — Constitutional Law I', faculty: 'Prof. Dr. Imran Sheikh',   submittedDate: '20 Feb 2026', status: 'finalized'  },
]

// ---------------------------------------------------------------------------
// Student Management 
// ---------------------------------------------------------------------------

export type StudentStatus = 'Active' | 'Inactive' | 'Enrolled' | 'Graduated' | 'Suspended' | 'Withdrawn' | 'Deferred'

export interface AdminStudent {
  id: string
  regNo: string
  name: string
  fatherName: string
  cnic: string
  phone: string
  email: string
  program: string
  currentSemester: string
  section: string
  shift: 'Morning' | 'Evening'
  admissionDate: string
  status: StudentStatus
  feeStatus: 'Paid' | 'Outstanding' | 'Partial'
  cgpa: string | null
}

export const adminStudents: AdminStudent[] = [
  { id: 's1',  regNo: 'MLC-LLB-24-118', name: 'Ahmad Raza',         fatherName: 'Mohammad Raza',   cnic: '35202-1234567-1', phone: '+92-300-1234567', email: 'a.raza@student.mlc.edu.pk',     program: 'LLB (5-Year)', currentSemester: 'Semester 5', section: 'Section A', shift: 'Morning', admissionDate: '01 Sep 2024', status: 'Active',    feeStatus: 'Outstanding', cgpa: '3.54' },
  { id: 's2',  regNo: 'MLC-LLB-24-119', name: 'Sana Malik',         fatherName: 'Tariq Malik',     cnic: '35202-7654321-2', phone: '+92-333-9876543', email: 's.malik@student.mlc.edu.pk',    program: 'LLB (5-Year)', currentSemester: 'Semester 5', section: 'Section A', shift: 'Morning', admissionDate: '01 Sep 2024', status: 'Active',    feeStatus: 'Paid',        cgpa: '3.71' },
  { id: 's3',  regNo: 'MLC-LLB-24-120', name: 'Hassan Ali',         fatherName: 'Ali Ahmed',       cnic: '35202-1122334-3', phone: '+92-321-5554433', email: 'h.ali@student.mlc.edu.pk',      program: 'LLB (5-Year)', currentSemester: 'Semester 5', section: 'Section B', shift: 'Morning', admissionDate: '01 Sep 2024', status: 'Active',    feeStatus: 'Paid',        cgpa: '3.20' },
  { id: 's4',  regNo: 'MLC-LLB-25-045', name: 'Zara Malik',         fatherName: 'Nasir Malik',     cnic: '35202-9988776-4', phone: '+92-300-8887766', email: 'z.malik@student.mlc.edu.pk',    program: 'LLB (5-Year)', currentSemester: 'Semester 3', section: 'Section A', shift: 'Morning', admissionDate: '01 Sep 2025', status: 'Enrolled',  feeStatus: 'Paid',        cgpa: null   },
  { id: 's5',  regNo: 'MLC-LLB-25-046', name: 'Usman Tariq',        fatherName: 'Tariq Hussain',   cnic: '35202-6655443-5', phone: '+92-345-1230987', email: 'u.tariq@student.mlc.edu.pk',    program: 'LLB (5-Year)', currentSemester: 'Semester 3', section: 'Section B', shift: 'Evening', admissionDate: '01 Sep 2025', status: 'Enrolled',  feeStatus: 'Outstanding', cgpa: null   },
  { id: 's6',  regNo: 'MLC-LLB-22-010', name: 'Rabia Noor',         fatherName: 'Noor Mohammad',   cnic: '35202-2233445-6', phone: '+92-312-4455667', email: 'r.noor@student.mlc.edu.pk',     program: 'LLB (5-Year)', currentSemester: 'Semester 9', section: 'Section A', shift: 'Morning', admissionDate: '01 Sep 2022', status: 'Active',    feeStatus: 'Paid',        cgpa: '3.82' },
  { id: 's7',  regNo: 'MLC-LLB-21-003', name: 'Bilal Farooq',       fatherName: 'Farooq Ahmed',    cnic: '35202-3344556-7', phone: '+92-300-9988776', email: 'b.farooq@student.mlc.edu.pk',   program: 'LLB (5-Year)', currentSemester: '—',          section: '—',         shift: 'Morning', admissionDate: '01 Sep 2021', status: 'Graduated', feeStatus: 'Paid',        cgpa: '3.65' },
  { id: 's8',  regNo: 'MLC-LLB-24-125', name: 'Mehwish Iqbal',      fatherName: 'Iqbal Hussain',   cnic: '35202-4455667-8', phone: '+92-323-6677889', email: 'm.iqbal@student.mlc.edu.pk',    program: 'LLB (5-Year)', currentSemester: 'Semester 5', section: 'Section C', shift: 'Evening', admissionDate: '01 Sep 2024', status: 'Suspended', feeStatus: 'Outstanding', cgpa: '2.90' },
  { id: 's9',  regNo: 'MLC-LLB-23-067', name: 'Faisal Chaudhry',    fatherName: 'Chaudhry Akram',  cnic: '35202-5566778-9', phone: '+92-300-7766554', email: 'f.chaudhry@student.mlc.edu.pk', program: 'LLB (5-Year)', currentSemester: 'Semester 7', section: 'Section B', shift: 'Morning', admissionDate: '01 Sep 2023', status: 'Active',    feeStatus: 'Paid',        cgpa: '3.45' },
  { id: 's10', regNo: 'MLC-LLB-25-050', name: 'Ayesha Butt',        fatherName: 'Amjad Butt',      cnic: '35202-6677889-0', phone: '+92-345-8899001', email: 'a.butt@student.mlc.edu.pk',     program: 'LLB (5-Year)', currentSemester: 'Semester 3', section: 'Section C', shift: 'Evening', admissionDate: '01 Sep 2025', status: 'Deferred',  feeStatus: 'Partial',     cgpa: null   },
]

// ---------------------------------------------------------------------------
// Faculty Management
// ---------------------------------------------------------------------------

export type FacultyStatus = 'Active' | 'Inactive' | 'On Leave'
export type Designation = 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Visiting Lecturer'

export interface FacultyMember {
  id: string
  name: string
  designation: Designation
  email: string
  phone: string
  cnic: string
  joinDate: string
  status: FacultyStatus
  assignedSubjects: string[]
}

export const facultyMembers: FacultyMember[] = [
  { id: 'f1', name: 'Prof. Dr. Imran Sheikh',    designation: 'Professor',              email: 'i.sheikh@mlc.edu.pk',    phone: '+92-300-1112233', cnic: '35202-1010101-1', joinDate: '01 Mar 2010', status: 'Active',   assignedSubjects: ['LAW-312 — Constitutional Law I', 'LAW-501 — Administrative Law', 'LAW-305 — Jurisprudence'] },
  { id: 'f2', name: 'Assist. Prof. S. Rai Anwar',designation: 'Assistant Professor',    email: 's.anwar@mlc.edu.pk',     phone: '+92-321-2223344', cnic: '35202-2020202-2', joinDate: '01 Aug 2015', status: 'Active',   assignedSubjects: ['LAW-301 — Law of Contract', 'LAW-401 — Law of Tort'] },
  { id: 'f3', name: 'Ms. Farah Qureshi',         designation: 'Lecturer',               email: 'f.qureshi@mlc.edu.pk',   phone: '+92-333-3334455', cnic: '35202-3030303-3', joinDate: '01 Jan 2018', status: 'Active',   assignedSubjects: ['LAW-320 — Legal Research & Writing', 'LAW-510 — Family Law'] },
  { id: 'f4', name: 'Mr. Bilal Hashmi',           designation: 'Lecturer',               email: 'b.hashmi@mlc.edu.pk',    phone: '+92-312-4445566', cnic: '35202-4040404-4', joinDate: '01 Sep 2019', status: 'Active',   assignedSubjects: ['LAW-330 — Criminal Law I', 'LAW-520 — Evidence Law'] },
  { id: 'f5', name: 'Mr. Kamran Siddiqui',        designation: 'Visiting Lecturer',      email: 'k.siddiqui@mlc.edu.pk', phone: '+92-345-5556677', cnic: '35202-5050505-5', joinDate: '01 Sep 2026', status: 'Active',   assignedSubjects: ['LAW-530 — Land Law'] },
  { id: 'f6', name: 'Dr. Amna Waseem',            designation: 'Associate Professor',    email: 'a.waseem@mlc.edu.pk',   phone: '+92-300-6667788', cnic: '35202-6060606-6', joinDate: '01 Jun 2013', status: 'On Leave', assignedSubjects: ['LAW-610 — International Law'] },
  { id: 'f7', name: 'Mr. Shahid Pervaiz',         designation: 'Lecturer',               email: 's.pervaiz@mlc.edu.pk',  phone: '+92-323-7778899', cnic: '35202-7070707-7', joinDate: '01 Feb 2020', status: 'Inactive', assignedSubjects: [] },
]

// ---------------------------------------------------------------------------
// Course Management
// ---------------------------------------------------------------------------

export interface Course {
  id: string
  code: string
  title: string
  creditHours: number
  prerequisite: string | null
  assignedFaculty: string | null
  assignedSections: string[]
  description: string
}

export const courses: Course[] = [
  { id: 'c1',  code: 'LAW-101', title: 'Introduction to Law',           creditHours: 3, prerequisite: null,      assignedFaculty: 'Prof. Dr. Imran Sheikh',    assignedSections: ['Semester 1 — Sec A', 'Semester 1 — Sec B', 'Semester 1 — Sec C'], description: 'Foundations of the legal system, sources of law, and legal reasoning.' },
  { id: 'c2',  code: 'LAW-102', title: 'Legal Systems',                  creditHours: 3, prerequisite: null,      assignedFaculty: 'Assist. Prof. S. Rai Anwar', assignedSections: ['Semester 1 — Sec A', 'Semester 1 — Sec B'],                          description: 'Comparative study of common law, civil law, and Islamic legal systems.' },
  { id: 'c3',  code: 'LAW-301', title: 'Law of Contract',                creditHours: 3, prerequisite: 'LAW-101', assignedFaculty: 'Assist. Prof. S. Rai Anwar', assignedSections: ['Semester 3 — Sec A', 'Semester 3 — Sec B'],                          description: 'Formation, performance, breach, and remedies under contract law.' },
  { id: 'c4',  code: 'LAW-305', title: 'Jurisprudence',                  creditHours: 3, prerequisite: 'LAW-102', assignedFaculty: 'Prof. Dr. Imran Sheikh',    assignedSections: ['Semester 3 — Sec A', 'Semester 3 — Sec B'],                          description: 'Legal theory and the philosophical foundations of law.' },
  { id: 'c5',  code: 'LAW-312', title: 'Constitutional Law I',           creditHours: 4, prerequisite: 'LAW-101', assignedFaculty: 'Prof. Dr. Imran Sheikh',    assignedSections: ['Semester 3 — Sec A', 'Semester 3 — Sec B'],                          description: 'Structure of the state, fundamental rights, and constitutional interpretation.' },
  { id: 'c6',  code: 'LAW-320', title: 'Legal Research & Writing',       creditHours: 2, prerequisite: null,      assignedFaculty: 'Ms. Farah Qureshi',        assignedSections: ['Semester 3 — Sec A', 'Semester 3 — Sec B'],                          description: 'Legal citation, case briefing, and drafting memoranda and opinions.' },
  { id: 'c7',  code: 'LAW-330', title: 'Criminal Law I',                 creditHours: 3, prerequisite: 'LAW-101', assignedFaculty: 'Mr. Bilal Hashmi',         assignedSections: ['Semester 3 — Sec A', 'Semester 3 — Sec B'],                          description: 'General principles of criminal liability and major offences.' },
  { id: 'c8',  code: 'LAW-401', title: 'Law of Tort',                    creditHours: 3, prerequisite: 'LAW-301', assignedFaculty: 'Assist. Prof. S. Rai Anwar', assignedSections: ['Semester 4 — Sec A'],                                               description: 'Civil wrongs, negligence, strict liability, and defamation.' },
  { id: 'c9',  code: 'LAW-501', title: 'Administrative Law',             creditHours: 3, prerequisite: 'LAW-312', assignedFaculty: 'Prof. Dr. Imran Sheikh',    assignedSections: ['Semester 5 — Sec A', 'Semester 5 — Sec B', 'Semester 5 — Sec C', 'Semester 5 — Sec D'], description: 'Principles governing administrative bodies and judicial review.' },
  { id: 'c10', code: 'LAW-510', title: 'Family Law',                     creditHours: 3, prerequisite: null,      assignedFaculty: 'Ms. Farah Qureshi',        assignedSections: ['Semester 5 — Sec A', 'Semester 5 — Sec B'],                          description: 'Marriage, divorce, custody, and inheritance under Pakistani law.' },
  { id: 'c11', code: 'LAW-520', title: 'Evidence Law',                   creditHours: 3, prerequisite: 'LAW-330', assignedFaculty: 'Mr. Bilal Hashmi',         assignedSections: ['Semester 5 — Sec C', 'Semester 5 — Sec D'],                          description: 'Rules of evidence in civil and criminal proceedings.' },
  { id: 'c12', code: 'LAW-530', title: 'Land Law',                       creditHours: 3, prerequisite: null,      assignedFaculty: 'Mr. Kamran Siddiqui',      assignedSections: ['Semester 5 — Sec A', 'Semester 5 — Sec D'],                          description: 'Property rights, transfer of property, and land revenue laws.' },
  { id: 'c13', code: 'LAW-610', title: 'International Law',              creditHours: 3, prerequisite: 'LAW-312', assignedFaculty: null,                       assignedSections: [],                                                                    description: 'Principles of public international law, treaties, and state responsibility.' },
]
