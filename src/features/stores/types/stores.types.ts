import type { PaginationMeta } from "@/lib/api/types"

export type StoreRating = {
  average: number
  count: number
}

export type AdminStoreSummary = {
  id: string
  userId: string
  slug: string
  name: string
  logo: string
  rating: StoreRating
  totalProducts: number
  totalOrders: number
  totalSales: number
  joinedAt: string
  isActive: boolean
  isSuspended: boolean
}

export type StoreCategory = {
  id: string
  name: string
  slug: string
}

export type StoreContact = {
  email: string
  phone: string
}

export type StoreAddress = {
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type AdminStoreDetail = AdminStoreSummary & {
  banner: string
  description: string
  contact: StoreContact
  address: StoreAddress
  categories: StoreCategory[]
  returnPolicy: string
  shippingPolicy: string
  payout: unknown | null
}

export type StoreVisibilityFilter = "all" | "listed" | "hidden"

export type StoreSort =
  "name" | "-name" | "joinedAt" | "-joinedAt" | "rating" | "-rating" | "popular"

export type ListAdminStoresParams = {
  page?: number
  limit?: number
  search?: string
  visibility?: StoreVisibilityFilter
  sort?: StoreSort
}

export type ListAdminStoresResult = {
  items: AdminStoreSummary[]
  pagination: PaginationMeta
}
