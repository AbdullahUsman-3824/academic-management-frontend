import apiClient from './client';

export type FacultyStatus = 'active' | 'inactive';

export interface Faculty {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  cnic?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  designation?: string | null;
  qualification?: string | null;
  joiningDate?: string | null;
  status: FacultyStatus;
  createdAt: string;
}

export interface FacultyWithUser extends Faculty {
  user?: {
    id: string;
    username: string;
  };
}

export interface FacultyListResult {
  data: Faculty[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateFacultyPayload {
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  cnic?: string;
  phone?: string;
  address?: string;
  city?: string;
  designation?: string;
  qualification?: string;
  joiningDate?: string;
  username?: string;
  password?: string;
}

export interface UpdateFacultyPayload {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  cnic?: string;
  phone?: string;
  address?: string;
  city?: string;
  designation?: string;
  qualification?: string;
  joiningDate?: string;
}

export interface TeachingLoad {
  allocations: any[];
  totalCourses: number;
  totalCreditHours: number;
}

type ApiList = {
  success: boolean;
  data: Faculty[];
  meta: FacultyListResult['meta'];
};

type ApiOne = {
  success: boolean;
  data: FacultyWithUser;
};

type ApiTeachingLoad = {
  success: boolean;
  data: TeachingLoad;
};

export async function getFaculty(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: FacultyStatus;
  designation?: string;
}): Promise<FacultyListResult> {
  const { data } = await apiClient.get<ApiList>('/faculty', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.designation ? { designation: params.designation } : {}),
    },
  });
  return { data: data.data, meta: data.meta };
}

export async function getFacultyById(id: string): Promise<FacultyWithUser> {
  const { data } = await apiClient.get<ApiOne>(`/faculty/${id}`);
  return data.data;
}

export async function createFaculty(
  payload: CreateFacultyPayload,
): Promise<FacultyWithUser> {
  const { data } = await apiClient.post<ApiOne>('/faculty', payload);
  return data.data;
}

export async function updateFaculty(
  id: string,
  payload: UpdateFacultyPayload,
): Promise<FacultyWithUser> {
  const { data } = await apiClient.patch<ApiOne>(`/faculty/${id}`, payload);
  return data.data;
}

export async function updateFacultyStatus(
  id: string,
  status: FacultyStatus,
): Promise<FacultyWithUser> {
  const { data } = await apiClient.patch<ApiOne>(`/faculty/${id}/status`, {
    status,
  });
  return data.data;
}

export async function deleteFaculty(id: string): Promise<void> {
  await apiClient.delete(`/faculty/${id}`);
}

export async function getFacultyTeachingLoad(
  id: string,
  academicSessionId?: string,
): Promise<TeachingLoad> {
  const { data } = await apiClient.get<ApiTeachingLoad>(
    `/faculty/${id}/teaching-load`,
    {
      params: academicSessionId ? { academicSessionId } : undefined,
    },
  );
  return data.data;
}
