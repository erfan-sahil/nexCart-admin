import type { PaginationMeta } from "@/lib/api/types"

export const PRODUCT_STATUSES = ["active", "archived"] as const

export const PRODUCT_APPROVAL_STATUSES = [
  "pending",
  "submitted",
  "approved",
  "rejected",
] as const

export const PRODUCT_SORTS = [
  "-createdAt",
  "createdAt",
  "name",
  "-name",
  "-rating",
  "rating",
] as const

export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export type ProductApprovalStatus = (typeof PRODUCT_APPROVAL_STATUSES)[number]

export type ProductSort = (typeof PRODUCT_SORTS)[number]

export type AttributeType =
  "text" | "number" | "boolean" | "select" | "multiselect"

export type AttributeRole = "spec" | "variant"

export type ProductImage = {
  id: string
  provider: "local"
  url: string
  mimeType: string
  size: number
  alt: string
  sortOrder: number
}

export type ProductSummaryRef = {
  id: string
  name: string
  slug: string
}

export type ProductAttributeOption = {
  id: string
  label: string
  value: string
}

export type ProductAttribute = {
  attributeId: string
  name: string
  slug: string
  type: AttributeType
  role: AttributeRole
  unit: string
  text: string | null
  number: number | null
  boolean: boolean | null
  options: ProductAttributeOption[]
}

export type ProductOffer = {
  minPrice: number | null
  maxPrice: number | null
  inStock: boolean
  variantCount: number
  defaultVariantId: string | null
}

export type Product = {
  id: string
  storeId: string
  categoryId: string
  store: ProductSummaryRef
  category: ProductSummaryRef
  name: string
  slug: string
  shortDescription: string
  description: string
  images: ProductImage[]
  thumbnail: ProductImage | null
  attributes: ProductAttribute[]
  offer: ProductOffer
  tags: string[]
  status: ProductStatus
  approvalStatus: ProductApprovalStatus
  reviewNote: string
  isFeatured: boolean
  isPublished: boolean
  ratingSummary: {
    average: number
    count: number
  }
  createdAt: string
  updatedAt: string
}

export type ProductVariant = {
  id: string
  productId: string
  sku: string
  price: number
  compareAtPrice: number | null
  stock: number
  image: ProductImage | null
  attributes: ProductAttribute[]
  status: ProductStatus
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type ListProductsParams = {
  page?: number
  limit?: number
  search?: string
  sort?: ProductSort
  status?: ProductStatus
  approvalStatus?: ProductApprovalStatus
}

export type ListProductsResult = {
  items: Product[]
  pagination: PaginationMeta
}

export type ListVariantsResult = {
  items: ProductVariant[]
  pagination: PaginationMeta
}
