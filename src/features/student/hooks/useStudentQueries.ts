import { useQuery } from "@tanstack/react-query";
import * as studentApi from "../api/student.api";
import type { StudentMarksParams } from "../types/student.types";

// All student self-service queries live under the ["student"] key so they
// can be cleared together on logout.
export const studentKeys = {
  all: ["student"] as const,
  me: () => ["student", "me"] as const,
  dashboard: () => ["student", "dashboard"] as const,
  courseOptions: () => ["student", "course-options"] as const,
  marks: (params: StudentMarksParams) =>
    ["student", "marks", params.courseId ?? null, params.category ?? null] as const,
  results: () => ["student", "results"] as const,
  fees: () => ["student", "fees"] as const,
  profile: () => ["student", "profile"] as const,
};

export const useStudentMe = () =>
  useQuery({
    queryKey: studentKeys.me(),
    queryFn: studentApi.getMyBasicInfo,
    staleTime: 5 * 60 * 1000,
  });

export const useStudentDashboard = () =>
  useQuery({
    queryKey: studentKeys.dashboard(),
    queryFn: studentApi.getMyDashboard,
    staleTime: 2 * 60 * 1000,
  });

export const useStudentCourseOptions = () =>
  useQuery({
    queryKey: studentKeys.courseOptions(),
    queryFn: studentApi.getMyCourseOptions,
    staleTime: 5 * 60 * 1000,
  });

export const useStudentMarks = (params: StudentMarksParams = {}) =>
  useQuery({
    queryKey: studentKeys.marks(params),
    queryFn: () => studentApi.getMyMarks(params),
    staleTime: 60 * 1000,
  });

export const useStudentResults = () =>
  useQuery({
    queryKey: studentKeys.results(),
    queryFn: studentApi.getMyResults,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

export const useStudentFees = () =>
  useQuery({
    queryKey: studentKeys.fees(),
    queryFn: studentApi.getMyFees,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

export const useStudentProfile = () =>
  useQuery({
    queryKey: studentKeys.profile(),
    queryFn: studentApi.getMyProfile,
    staleTime: 5 * 60 * 1000,
  });