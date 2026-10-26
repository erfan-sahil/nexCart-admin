import type { ListVendorApplicationsParams } from "../types"

export const vendorApplicationsQueryKey = {
  all: ["vendor-applications"] as const,
  lists: () => [...vendorApplicationsQueryKey.all, "list"] as const,
  list: (params: ListVendorApplicationsParams) =>
    [...vendorApplicationsQueryKey.lists(), params] as const,
  details: () => [...vendorApplicationsQueryKey.all, "detail"] as const,
  detail: (id: string) =>
    [...vendorApplicationsQueryKey.details(), id] as const,
}

export const categoryNamesQueryKey = ["categories", "name-map"] as const
