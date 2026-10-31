import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  listFeaturedCategories,
  listRootCategories,
  setCategoryFeatured,
  updateFeaturedCategoryOrder,
} from "./featured-categories.api"

export const featuredCategoriesKeys = {
  all: ["featured-categories"] as const,
  roots: ["featured-categories", "roots"] as const,
}

export function useFeaturedCategoriesQuery() {
  return useQuery({
    queryKey: featuredCategoriesKeys.all,
    queryFn: listFeaturedCategories,
  })
}

export function useRootCategoriesQuery() {
  return useQuery({
    queryKey: featuredCategoriesKeys.roots,
    queryFn: listRootCategories,
  })
}

export function useSetCategoryFeaturedMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      setCategoryFeatured(id, isFeatured),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: featuredCategoriesKeys.all,
      })
      void queryClient.invalidateQueries({
        queryKey: featuredCategoriesKeys.roots,
      })
    },
  })
}

export function useUpdateFeaturedOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryIds: string[]) =>
      updateFeaturedCategoryOrder(categoryIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: featuredCategoriesKeys.all,
      })
    },
  })
}
