import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  categoriesQueryKey,
  createCategory,
  listCategories,
  listCategoryTree,
} from "../services"
import type { CreateCategoryPayload, ListCategoriesParams } from "../types"

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
