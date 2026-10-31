import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getSiteSettings,
  saveSiteSettings,
  siteSettingsQueryKey,
} from "../services"
import type { UpdateSiteSettingsPayload } from "../types"

export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: siteSettingsQueryKey,
    queryFn: getSiteSettings,
    staleTime: 30_000,
  })
}

export function useSaveSiteSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateSiteSettingsPayload) => saveSiteSettings(input),
    onSuccess: (settings) => {
      queryClient.setQueryData(siteSettingsQueryKey, settings)
    },
  })
}
