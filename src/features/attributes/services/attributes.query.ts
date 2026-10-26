import type { ListAttributesParams } from "../types"

export const attributesQueryKey = {
  all: ["attributes"] as const,
  lists: () => [...attributesQueryKey.all, "list"] as const,
  list: (params: ListAttributesParams) =>
    [...attributesQueryKey.lists(), params] as const,
}
