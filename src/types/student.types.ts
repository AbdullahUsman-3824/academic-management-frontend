export type StudentStatus = "active" | "inactive" | "graduated";
export type Gender = "male" | "female" | "other";

export interface BatchRef {
  id: string;
  name: string;
}

export interface StudentListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentStatus;
  batchId?: string;
}
