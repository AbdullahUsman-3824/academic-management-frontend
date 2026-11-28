import type {
  BatchCurriculum,
  CourseAllocation,
  FacultyOption,
  MockCourse,
  StudentEnrollment,
} from "../types/course.types";

export const mockSessions = [
  { id: "session-fall-2026", name: "Fall 2026" },
  { id: "session-spring-2027", name: "Spring 2027" },
];

export const mockBatches = [
  { id: "batch-sp23", name: "SP23" },
  { id: "batch-sp24", name: "SP24" },
  { id: "batch-sp25", name: "SP25" },
];

export const mockSections = [
  { id: "section-a", name: "A" },
  { id: "section-b", name: "B" },
  { id: "section-c", name: "C" },
];

export const mockFaculty: FacultyOption[] = [
  {
    id: "faculty-ahmed",
    name: "Dr. Ahmed",
    employeeNumber: "EMP-101",
    status: "active",
    workload: 3,
  },
  {
    id: "faculty-sara",
    name: "Ms. Sara",
    employeeNumber: "EMP-102",
    status: "active",
    workload: 2,
  },
  {
    id: "faculty-usman",
    name: "Mr. Usman",
    employeeNumber: "EMP-103",
    status: "active",
    workload: 1,
  },
];

export const mockCourses: MockCourse[] = [
  {
    id: "course-cs301",
    code: "CS301",
    name: "Database Systems",
    description: "Database design and implementation.",
    creditHours: 3,
  },
  {
    id: "course-cs302",
    code: "CS302",
    name: "Operating Systems",
    description: "Operating system concepts.",
    creditHours: 3,
  },
  {
    id: "course-cs303",
    code: "CS303",
    name: "Software Engineering",
    description: "Software development lifecycle and practices.",
    creditHours: 3,
  },
  {
    id: "course-cs304",
    code: "CS304",
    name: "Computer Networks",
    description: "Network architectures and protocols.",
    creditHours: 3,
  },
  {
    id: "course-cs305",
    code: "CS305",
    name: "Programming Fundamentals",
    description: "Foundations of programming.",
    creditHours: 4,
  },
];

export const mockCurricula: BatchCurriculum[] = [
  {
    batchId: "batch-sp23",
    batchName: "SP23",
    semesters: [
      {
        semesterNumber: 1,
        status: "locked",
        minCredits: 12,
        maxCredits: 18,
        courses: mockCourses
          .slice(0, 4)
          .map((course) => ({
            courseId: course.id,
            code: course.code,
            name: course.name,
            creditHours: course.creditHours,
            mandatory: true,
          })),
      },
      {
        semesterNumber: 2,
        status: "active",
        minCredits: 12,
        maxCredits: 18,
        courses: mockCourses
          .slice(1, 5)
          .map((course) => ({
            courseId: course.id,
            code: course.code,
            name: course.name,
            creditHours: course.creditHours,
            mandatory: true,
          })),
      },
      {
        semesterNumber: 3,
        status: "upcoming",
        minCredits: 12,
        maxCredits: 18,
        courses: mockCourses
          .slice(0, 3)
          .map((course) => ({
            courseId: course.id,
            code: course.code,
            name: course.name,
            creditHours: course.creditHours,
            mandatory: true,
          })),
      },
    ],
  },
  {
    batchId: "batch-sp24",
    batchName: "SP24",
    semesters: [
      {
        semesterNumber: 1,
        status: "locked",
        minCredits: 12,
        maxCredits: 18,
        courses: mockCourses
          .slice(0, 4)
          .map((course) => ({
            courseId: course.id,
            code: course.code,
            name: course.name,
            creditHours: course.creditHours,
            mandatory: true,
          })),
      },
      {
        semesterNumber: 2,
        status: "active",
        minCredits: 12,
        maxCredits: 18,
        courses: mockCourses
          .slice(1, 4)
          .map((course) => ({
            courseId: course.id,
            code: course.code,
            name: course.name,
            creditHours: course.creditHours,
            mandatory: true,
          })),
      },
    ],
  },
];
