import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  attributesQueryKey,
  createAttribute,
  listAttributes,
} from "../services"
import type { CreateAttributePayload, ListAttributesParams } from "../types"

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
