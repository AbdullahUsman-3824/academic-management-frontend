import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../api/allocations";

export const allocationKeys = {
  all: ["allocations"] as const,
  list: (params?: {
    facultyId?: string;
    sectionId?: string;
    semesterNumber?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) => [...allocationKeys.all, "list", params] as const,
  detail: (id: string) => [...allocationKeys.all, "detail", id] as const,
  sectionSemester: (sectionId: string, semesterNumber: number) =>
    [
      ...allocationKeys.all,
      "section-semester",
      sectionId,
      semesterNumber,
    ] as const,
};

export function useAllocations(params?: {
  facultyId?: string;
  sectionId?: string;
  semesterNumber?: number;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: allocationKeys.list(params),
    queryFn: () => api.getAllocations(params),
    // Only fetch when sectionId is provided
    enabled: !!params?.sectionId,
  });
}

export function useAllocation(id: string | null) {
  return useQuery({
    queryKey: allocationKeys.detail(id ?? ""),
    queryFn: () => api.getAllocation(id!),
    enabled: !!id,
  });
}

export function useAllocationsBySectionSemester(
  sectionId: string | null,
  semesterNumber: number | null,
) {
  return useQuery({
    queryKey: allocationKeys.sectionSemester(
      sectionId ?? "",
      semesterNumber ?? 0,
    ),
    queryFn: () =>
      api.getAllocationsBySectionSemester(sectionId!, semesterNumber!),
    enabled: !!sectionId && semesterNumber !== null,
  });
}

export function useCreateAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createAllocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: allocationKeys.all });
    },
  });
}

export function useBulkCreateAllocations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.bulkCreateAllocations,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: allocationKeys.all });
    },
  });
}

export function useDeleteAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteAllocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: allocationKeys.all });
    },
  });
}
