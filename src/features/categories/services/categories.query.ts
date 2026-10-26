import type { ListCategoriesParams } from "../types"

export const categoriesQueryKey = {
  all: ["categories"] as const,
  lists: () => [...categoriesQueryKey.all, "list"] as const,
  list: (params: ListCategoriesParams) =>
    [...categoriesQueryKey.lists(), params] as const,
  trees: () => [...categoriesQueryKey.all, "tree"] as const,
  tree: () => [...categoriesQueryKey.trees()] as const,
}
