export const student = {
  name: 'Ahmad Raza',
  greetingName: 'Ahmad',
  initials: 'AR',
  regNo: 'MLC-LLB-24-118',
  program: 'LLB · Semester 3',
  section: 'Section A',
  enrollmentStatus: 'Enrollment Active',

  // Extended profile fields for ProfilePage
  fatherName: 'Mohammad Raza',
  dateOfBirth: '14 March 2003',
  cnic: '35202-1234567-1',
  gender: 'Male',
  nationality: 'Pakistani',
  religion: 'Islam',
  email: 'ahmad.raza@student.mlc.edu.pk',
  phone: '+92-300-1234567',
  address: 'House 12, Street 5, Model Town, Lahore',
  admissionDate: '01 September 2024',
  degree: 'LLB (5-Year)',
  department: 'Faculty of Law',
  shift: 'Morning',
  guardianName: 'Mohammad Raza',
  guardianPhone: '+92-321-9876543',
  guardianRelation: 'Father',
}

export const subjects = [
  {
    code: 'LAW-301',
    title: 'Law of Contract',
    faculty: 'Assist. Prof. S. Rai Anwar',
    credits: '3.0',
    description: 'Formation, performance, breach, and remedies under contract law.',
  },
  {
    code: 'LAW-312',
    title: 'Constitutional Law I',
    faculty: 'Prof. Dr. Imran Sheikh',
    credits: '4.0',
    description: 'Structure of the state, fundamental rights, and constitutional interpretation.',
  },
  {
    code: 'LAW-320',
    title: 'Legal Research & Writing',
    faculty: 'Ms. Farah Qureshi',
    credits: '2.0',
    description: 'Legal citation, case briefing, and drafting memoranda and opinions.',
  },
  {
    code: 'LAW-305',
    title: 'Jurisprudence',
    faculty: 'Prof. Dr. Imran Sheikh',
    credits: '3.0',
    description: 'Legal theory and the philosophical foundations of law.',
  },
  {
    code: 'LAW-330',
    title: 'Criminal Law I',
    faculty: 'Mr. Bilal Hashmi',
    credits: '3.0',
    description: 'General principles of criminal liability and major offences.',
  },
]

export const semesterResults = [
  {
    id: 'sem1',
    label: 'Semester 1',
    status: 'finalized',
    gpa: '3.40',
    subjects: [
      { code: 'LAW-101', title: 'Introduction to Law', credits: '3.0', grade: 'A-', points: '3.7' },
      { code: 'LAW-102', title: 'Legal Systems', credits: '3.0', grade: 'B+', points: '3.3' },
      { code: 'ENG-101', title: 'Legal English', credits: '2.0', grade: 'A', points: '4.0' },
      { code: 'LAW-110', title: 'Constitutional History', credits: '3.0', grade: 'B+', points: '3.3' },
    ],
  },
  {
    id: 'sem2',
    label: 'Semester 2',
    status: 'finalized',
    gpa: '3.48',
    subjects: [
      { code: 'LAW-201', title: 'Law of Torts', credits: '3.0', grade: 'A-', points: '3.7' },
      { code: 'LAW-210', title: 'Constitutional Law I Foundations', credits: '3.0', grade: 'A', points: '4.0' },
      { code: 'LAW-220', title: 'Legal Methods', credits: '2.0', grade: 'B+', points: '3.3' },
      { code: 'LAW-230', title: 'Islamic Jurisprudence', credits: '3.0', grade: 'A-', points: '3.7' },
    ],
  },
  {
    id: 'sem3',
    label: 'Semester 3',
    status: 'in-progress',
    gpa: null,
    subjects: subjects.map((subject) => ({
      code: subject.code,
      title: subject.title,
      credits: subject.credits,
      grade: '—',
      points: '—',
    })),
  },
]

export const academicHistory = {
  cgpa: '3.54',
  creditsEarned: '45',
}
export const feeStatus = {
  totalDue: 'Rs. 42,500',
  outstanding: 'Rs. 42,500',
  paid: 'Rs. 0',
  dueDate: '05 September 2026',
  isDefaulter: false,
}

export const activeVoucher = {
  voucherNo: 'MLC-V-2026-0342',
  semester: 'Semester 3',
  issueDate: '10 August 2026',
  dueDate: '05 September 2026',
  components: [
    { label: 'Tuition Fee', amount: 'Rs. 32,000' },
    { label: 'Examination Fee', amount: 'Rs. 4,500' },
    { label: 'Library Fee', amount: 'Rs. 2,000' },
    { label: 'Transport Fee', amount: 'Rs. 3,000' },
    { label: 'Other Charges', amount: 'Rs. 1,000' },
  ],
  total: 'Rs. 42,500',
}

export const paymentHistory = [
  { semester: 'Semester 1', amount: 'Rs. 38,000', status: 'ok', statusLabel: 'Paid', date: '02 Sep 2025' },
  { semester: 'Semester 2', amount: 'Rs. 40,000', status: 'ok', statusLabel: 'Paid', date: '05 Feb 2026' },
  { semester: 'Semester 3', amount: 'Rs. 42,500', status: 'pending', statusLabel: 'Outstanding', date: '—' },
]
export const marks = [
  // Current-semester entries (Semester 3) — ordered most-recent first
  { subjectCode: 'LAW-301', subjectTitle: 'Law of Contract',           category: 'Quiz',       title: 'Quiz 2',       score: '8 / 10',   status: 'ok',      statusLabel: 'Graded',          date: '21 Aug 2026' },
  { subjectCode: 'LAW-312', subjectTitle: 'Constitutional Law I',      category: 'Assignment', title: 'Assignment 1', score: '18 / 20',  status: 'ok',      statusLabel: 'Graded',          date: '19 Aug 2026' },
  { subjectCode: 'LAW-320', subjectTitle: 'Legal Research & Writing',  category: 'Mid-Term',   title: 'Mid-Term',     score: '— / 30',   status: 'pending', statusLabel: 'Awaiting result', date: '—'           },
  { subjectCode: 'LAW-330', subjectTitle: 'Criminal Law I',            category: 'Quiz',       title: 'Quiz 1',       score: '9 / 10',   status: 'ok',      statusLabel: 'Graded',          date: '14 Aug 2026' },
  { subjectCode: 'LAW-305', subjectTitle: 'Jurisprudence',             category: 'Assignment', title: 'Assignment 1', score: '16 / 20',  status: 'ok',      statusLabel: 'Graded',          date: '12 Aug 2026' },
  { subjectCode: 'LAW-301', subjectTitle: 'Law of Contract',           category: 'Assignment', title: 'Assignment 1', score: '17 / 20',  status: 'ok',      statusLabel: 'Graded',          date: '10 Aug 2026' },
  { subjectCode: 'LAW-312', subjectTitle: 'Constitutional Law I',      category: 'Quiz',       title: 'Quiz 1',       score: '7 / 10',   status: 'ok',      statusLabel: 'Graded',          date: '08 Aug 2026' },
  { subjectCode: 'LAW-305', subjectTitle: 'Jurisprudence',             category: 'Quiz',       title: 'Quiz 1',       score: '8 / 10',   status: 'ok',      statusLabel: 'Graded',          date: '05 Aug 2026' },
  { subjectCode: 'LAW-330', subjectTitle: 'Criminal Law I',            category: 'Assignment', title: 'Assignment 1', score: '19 / 20',  status: 'ok',      statusLabel: 'Graded',          date: '03 Aug 2026' },
  { subjectCode: 'LAW-301', subjectTitle: 'Law of Contract',           category: 'Quiz',       title: 'Quiz 1',       score: '9 / 10',   status: 'ok',      statusLabel: 'Graded',          date: '01 Aug 2026' },
  { subjectCode: 'LAW-301', subjectTitle: 'Law of Contract',           category: 'Final',      title: 'Final Exam',   score: '— / 80',   status: 'pending', statusLabel: 'Scheduled',       date: 'Nov 2026'    },
  { subjectCode: 'LAW-312', subjectTitle: 'Constitutional Law I',      category: 'Final',      title: 'Final Exam',   score: '— / 80',   status: 'pending', statusLabel: 'Scheduled',       date: 'Nov 2026'    },
  { subjectCode: 'LAW-320', subjectTitle: 'Legal Research & Writing',  category: 'Final',      title: 'Final Exam',   score: '— / 60',   status: 'pending', statusLabel: 'Scheduled',       date: 'Nov 2026'    },
  { subjectCode: 'LAW-305', subjectTitle: 'Jurisprudence',             category: 'Final',      title: 'Final Exam',   score: '— / 80',   status: 'pending', statusLabel: 'Scheduled',       date: 'Nov 2026'    },
  { subjectCode: 'LAW-330', subjectTitle: 'Criminal Law I',            category: 'Final',      title: 'Final Exam',   score: '— / 80',   status: 'pending', statusLabel: 'Scheduled',       date: 'Nov 2026'    },
]

export const announcements = [
  {
    tag: 'Institution',
    title: 'Mid-term examination schedule issued',
    body: 'Seating plans for Semester 3 mid-terms are now posted on the notice board and portal.',
    date: '22 August 2026',
  },
  {
    tag: 'Finance',
    title: 'Fee voucher due date approaching',
    body: 'Vouchers unpaid after 05 September will attract a daily fine as per policy.',
    date: '20 August 2026',
  },
  {
    tag: 'Student affairs',
    title: 'Moot court society — registrations open',
    body: 'Interested students may register with the student affairs office by 30 August.',
    date: '18 August 2026',
  },
  {
    tag: 'Academic',
    title: 'Course withdrawal deadline',
    body: 'The last date to withdraw from a course without academic penalty is 25 August.',
    date: '15 August 2026',
  },
  {
    tag: 'Institution',
    title: 'Library extended hours during exam season',
    body: 'The library will remain open until midnight from 28 August through the end of mid-terms.',
    date: '12 August 2026',
  },
  {
    tag: 'Student affairs',
    title: 'Annual law symposium — call for papers',
    body: 'Submit abstracts to the student affairs office by 10 September to be considered for presentation.',
    date: '08 August 2026',
  },
]
