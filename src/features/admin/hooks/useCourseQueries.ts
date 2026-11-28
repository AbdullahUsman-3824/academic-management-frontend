import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { batchCurriculumApi, coursesApi } from "../api/courses";
import type {
  CreateCoursePayload,
  SaveBatchCurriculumPayload,
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
