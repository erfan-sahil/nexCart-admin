import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  categoriesQueryKey,
  createCategory,
  deleteCategory,
  listCategories,
  listCategoryAttributes,
  listCategoryTree,
  replaceCategoryAttributes,
  updateCategory,
} from "../services"
import type {
  CreateCategoryPayload,
  ListCategoriesParams,
  ReplaceCategoryAttributesPayload,
  UpdateCategoryPayload,
} from "../types"

export function useCategoriesQuery(params: ListCategoriesParams) {
  return useQuery({
    queryKey: categoriesQueryKey.list(params),
    queryFn: () => listCategories(params),
    placeholderData: keepPreviousData,
  })
}

export function useCategoryTreeQuery() {
  return useQuery({
    queryKey: categoriesQueryKey.tree(),
    queryFn: listCategoryTree,
    staleTime: 60_000,
  })
}

export function useCategoryAttributesQuery(categoryId?: string) {
  return useQuery({
    queryKey: categoriesQueryKey.attributes(categoryId ?? "none"),
    queryFn: () => listCategoryAttributes(categoryId ?? ""),
    enabled: Boolean(categoryId),
  })
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoriesQueryKey.all,
      })
    },
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateCategoryPayload
    }) => updateCategory(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoriesQueryKey.all,
      })
    },
  })
}

export function useReplaceCategoryAttributesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ReplaceCategoryAttributesPayload
    }) => replaceCategoryAttributes(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoriesQueryKey.all,
      })
    },
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoriesQueryKey.all,
      })
    },
  })
}
