import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  listSponsoredPlacementsManage,
  upsertSponsoredPlacement,
  type SponsoredSlot,
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

export function useUpsertSponsoredMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      slot,
      payload,
    }: {
      slot: SponsoredSlot
      payload: UpsertSponsoredPayload
    }) => upsertSponsoredPlacement(slot, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sponsoredKeys.manage })
    },
  })
}
