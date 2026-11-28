import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  allocationApis,
  batchCurriculumApi,
  coursesApi,
} from "../api/courses";
import type {
  CreateAllocationPayload,
  CreateCoursePayload,
  SaveBatchCurriculumPayload,
  UpdateAllocationPayload,
  UpdateCoursePayload,
} from "../types/course.types";

export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (filters: { page?: number; search?: string }) =>
    [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  curriculum: () => [...courseKeys.all, "curriculum"] as const,
  batchCurriculum: (batchId: string) =>
    [...courseKeys.curriculum(), batchId] as const,
  batchCurriculumCopyPreview: (
    targetBatchId: string,
    sourceBatchId: string,
    semesterId?: string | null,
  ) =>
    [
      ...courseKeys.curriculum(),
      "copy-preview",
      targetBatchId,
      sourceBatchId,
      semesterId ?? null,
    ] as const,
};

export const allocationKeys = {
  all: ["allocations"] as const,
  currentSessionGroups: () =>
    [...allocationKeys.all, "groups", "current"] as const,
  facultyOptions: () => [...allocationKeys.all, "faculty-options"] as const,
  currentSection: (sectionId: string) =>
    [...allocationKeys.all, "current", sectionId] as const,
  sectionHistory: (sectionId: string) =>
    [...allocationKeys.all, "history", sectionId] as const,
};

export function useCurrentSessionGroups() {
  return useQuery({
    queryKey: allocationKeys.currentSessionGroups(),
    queryFn: allocationApis.getCurrentSessionGroups,
  });
}

export function useCurrentSectionAllocations(sectionId: string | null) {
  return useQuery({
    queryKey: allocationKeys.currentSection(sectionId ?? ""),
    queryFn: () => allocationApis.getCurrentSectionAllocations(sectionId!),
    enabled: !!sectionId,
  });
}

export function useAllocationFacultyOptions() {
  return useQuery({
    queryKey: allocationKeys.facultyOptions(),
    queryFn: allocationApis.getFacultyOptions,
  });
}

export function useSectionAllocationHistory(sectionId: string | null) {
  return useQuery({
    queryKey: allocationKeys.sectionHistory(sectionId ?? ""),
    queryFn: () => allocationApis.getSectionAllocationHistory(sectionId!),
    enabled: !!sectionId,
  });
}

export function useCreateAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAllocationPayload) =>
      allocationApis.createAllocation(payload),
    onSuccess: (_data, payload) => {
      qc.invalidateQueries({
        queryKey: allocationKeys.currentSection(payload.sectionId),
      });
      qc.invalidateQueries({
        queryKey: allocationKeys.facultyOptions(),
      });
      qc.invalidateQueries({
        queryKey: allocationKeys.sectionHistory(payload.sectionId),
      });
    },
  });
}

export function useUpdateAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      sectionId,
    }: {
      id: string;
      payload: UpdateAllocationPayload;
      sectionId: string;
    }) => allocationApis.updateAllocation(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: allocationKeys.currentSection(variables.sectionId),
      });
      qc.invalidateQueries({
        queryKey: allocationKeys.facultyOptions(),
      });
      qc.invalidateQueries({
        queryKey: allocationKeys.sectionHistory(variables.sectionId),
      });
    },
  });
}

export function useCourses(filters: {
  page?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: () =>
      coursesApi.list({
        page: filters.page ?? 1,
        limit: 20,
        search: filters.search || undefined,
      }),
    staleTime: 30_000,
  });
}

export function useCourse(id: string | null) {
  return useQuery({
    queryKey: courseKeys.detail(id ?? ""),
    queryFn: () => coursesApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => coursesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCoursePayload;
    }) => coursesApi.update(id, payload),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: courseKeys.lists() });
      qc.invalidateQueries({ queryKey: courseKeys.detail(v.id) });
    },
  });
}

export function useBatchCurriculum(batchId: string | null) {
  return useQuery({
    queryKey: courseKeys.batchCurriculum(batchId ?? ""),
    queryFn: () => batchCurriculumApi.get(batchId!),
    enabled: !!batchId,
  });
}

export function useBatchCurriculumCopyPreview(
  targetBatchId: string | null,
  sourceBatchId: string | null,
  semesterId?: string | null,
) {
  return useQuery({
    queryKey: courseKeys.batchCurriculumCopyPreview(
      targetBatchId ?? "",
      sourceBatchId ?? "",
      semesterId,
    ),
    queryFn: () =>
      batchCurriculumApi.copyPreview(
        targetBatchId!,
        sourceBatchId!,
        semesterId ?? undefined,
      ),
    enabled: !!targetBatchId && !!sourceBatchId,
  });
}

export function useSaveBatchCurriculum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      payload,
    }: {
      batchId: string;
      payload: SaveBatchCurriculumPayload;
    }) => batchCurriculumApi.save(batchId, payload),
    onSuccess: (data, variables) => {
      qc.setQueryData(courseKeys.batchCurriculum(variables.batchId), data);
      qc.invalidateQueries({
        queryKey: courseKeys.batchCurriculum(variables.batchId),
      });
    },
  });
}
