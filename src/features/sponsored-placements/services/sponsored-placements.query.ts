import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  listSponsoredPlacementsManage,
  upsertSponsoredPlacement,
  type UpsertSponsoredPayload,
} from "./sponsored-placements.api"

export const sponsoredKeys = {
  manage: ["sponsored-placements", "manage"] as const,
}

export function useSponsoredPlacementsQuery() {
  return useQuery({
    queryKey: sponsoredKeys.manage,
    queryFn: listSponsoredPlacementsManage,
  })
}

export function useUpsertSponsoredMutation(slot: "1" | "2") {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertSponsoredPayload) =>
      upsertSponsoredPlacement(slot, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sponsoredKeys.manage })
    },
  })
}
