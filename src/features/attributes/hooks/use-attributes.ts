import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  attributesQueryKey,
  createAttribute,
  deleteAttribute,
  listAttributes,
  updateAttribute,
} from "../services"
import type {
  CreateAttributePayload,
  ListAttributesParams,
  UpdateAttributePayload,
} from "../types"

export function useAttributesQuery(params: ListAttributesParams) {
  return useQuery({
    queryKey: attributesQueryKey.list(params),
    queryFn: () => listAttributes(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateAttributeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAttributePayload) => createAttribute(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: attributesQueryKey.lists(),
      })
    },
  })
}

export function useDeleteAttributeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAttribute(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: attributesQueryKey.lists(),
      })
    },
  })
}

export function useUpdateAttributeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateAttributePayload
    }) => updateAttribute(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: attributesQueryKey.lists(),
      })
    },
  })
}
