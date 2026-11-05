import type { AdminStoreSummary, StoreVisibilityFilter } from "./types"

export type StoreListingStatus = "listed" | "suspended" | "closed"

export const VISIBILITY_FILTER_LABEL: Record<StoreVisibilityFilter, string> = {
  all: "All stores",
  listed: "Listed on marketplace",
  hidden: "Hidden from shoppers",
}

export const STORE_LISTING_STATUS_LABEL: Record<StoreListingStatus, string> = {
  listed: "Listed",
  suspended: "Suspended",
  closed: "Closed",
}

export function storeListingStatus(
  store: Pick<AdminStoreSummary, "isActive" | "isSuspended">
): StoreListingStatus {
  if (store.isSuspended) {
    return "suspended"
  }

  if (!store.isActive) {
    return "closed"
  }

  return "listed"
}
