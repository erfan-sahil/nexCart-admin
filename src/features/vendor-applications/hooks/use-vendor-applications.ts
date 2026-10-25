import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  approveVendorApplication,
  categoryNamesQueryKey,
  getVendorApplication,
  listCategoryNames,
  listVendorApplications,
  rejectVendorApplication,
  requestVendorApplicationInfo,
  startVendorApplicationReview,
  vendorApplicationsQueryKey,
} from "../services"
import type { ListVendorApplicationsParams } from "../types"

export type ReviewAction =
  | { type: "start-review"; id: string; note?: string }
  | { type: "request-info"; id: string; note: string }
  | { type: "approve"; id: string; note?: string }
  | { type: "reject"; id: string; note: string }

export function useVendorApplicationsQuery(
  params: ListVendorApplicationsParams
) {
  return useQuery({
    queryKey: vendorApplicationsQueryKey.list(params),
    queryFn: () => listVendorApplications(params),
    placeholderData: keepPreviousData,
  })
}

export function useVendorApplicationQuery(id: string | null) {
  return useQuery({
    queryKey: vendorApplicationsQueryKey.detail(id ?? ""),
    queryFn: () => getVendorApplication(id ?? ""),
    enabled: Boolean(id),
  })
}

export function useCategoryNamesQuery(enabled: boolean) {
  return useQuery({
    queryKey: categoryNamesQueryKey,
    queryFn: listCategoryNames,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useReviewVendorApplicationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (action: ReviewAction) => {
      switch (action.type) {
        case "start-review":
          return startVendorApplicationReview(action.id, action.note)
        case "request-info":
          return requestVendorApplicationInfo(action.id, action.note)
        case "approve":
          return approveVendorApplication(action.id, action.note)
        case "reject":
          return rejectVendorApplication(action.id, action.note)
      }
    },
    onSuccess: async (application) => {
      queryClient.setQueryData(
        vendorApplicationsQueryKey.detail(application.id),
        application
      )
      await queryClient.invalidateQueries({
        queryKey: vendorApplicationsQueryKey.lists(),
      })
    },
  })
}
