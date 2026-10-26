import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  deleteUser,
  listUsers,
  setUserStatus,
  updateUser,
  usersQueryKey,
} from "../services"
import type {
  AccountStatusPayload,
  ListUsersParams,
  UpdateUserPayload,
} from "../types"

export function useUsersQuery(params: ListUsersParams) {
  return useQuery({
    queryKey: usersQueryKey.list(params),
    queryFn: () => listUsers(params),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey.lists() })
    },
  })
}

export function useSetUserStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: AccountStatusPayload
    }) => setUserStatus(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey.lists() })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey.lists() })
    },
  })
}
