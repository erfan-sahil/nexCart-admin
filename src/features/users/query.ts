import type { ListUsersParams } from "./types"

export const usersQueryKey = {
  all: ["users"] as const,
  lists: () => [...usersQueryKey.all, "list"] as const,
  list: (params: ListUsersParams) =>
    [...usersQueryKey.lists(), params] as const,
}
