import apiClient from "../../../api/client";
import type {
  ApiResponse,
  StudentBasicInfo,
  StudentDashboard,
  StudentCourseOption,
  StudentMark,
  StudentMarksParams,
  StudentProfile,
} from "../types/student.types";

const BASE = "/students/me";

/** GET /students/me */
export const getMyBasicInfo = async (): Promise<StudentBasicInfo> => {
  const res = await apiClient.get<ApiResponse<StudentBasicInfo>>(BASE);
  return res.data.data;
};

/** GET /students/me/dashboard */
export const getMyDashboard = async (): Promise<StudentDashboard> => {
  const res = await apiClient.get<ApiResponse<StudentDashboard>>(
    `${BASE}/dashboard`,
  );
  return res.data.data;
};

/** GET /students/me/course-options */
export const getMyCourseOptions = async (): Promise<StudentCourseOption[]> => {
  const res = await apiClient.get<ApiResponse<StudentCourseOption[]>>(
    `${BASE}/course-options`,
  );
  return res.data.data;
};

/** GET /students/me/marks?courseId=&category= */
export const getMyMarks = async (
  params: StudentMarksParams = {},
): Promise<StudentMark[]> => {
  // Only send filters that actually have a value
  const query: Record<string, string> = {};
  if (params.courseId) query.courseId = params.courseId;
  if (params.category) query.category = params.category;

  const res = await apiClient.get<ApiResponse<StudentMark[]>>(`${BASE}/marks`, {
    params: query,
  });
  return res.data.data;
};

/** GET /students/me/results (placeholder on the backend, no payload yet) */
export const getMyResults = async (): Promise<unknown> => {
  const res = await apiClient.get<ApiResponse<unknown> | undefined>(
    `${BASE}/results`,
  );
  // React Query forbids `undefined`, and the placeholder route has no body.
  return res.data?.data ?? null;
};

/** GET /students/me/fees (placeholder on the backend, no payload yet) */
export const getMyFees = async (): Promise<unknown> => {
  const res = await apiClient.get<ApiResponse<unknown> | undefined>(
    `${BASE}/fees`,
  );
  // React Query forbids `undefined`, and the placeholder route has no body.
  return res.data?.data ?? null;
};

/** GET /students/me/profile */
export const getMyProfile = async (): Promise<StudentProfile> => {
  const res = await apiClient.get<ApiResponse<StudentProfile>>(
    `${BASE}/profile`,
  );
  return res.data.data;
};