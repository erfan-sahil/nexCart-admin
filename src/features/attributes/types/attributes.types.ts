import type { PaginationMeta } from "@/lib/api/types"

export const ATTRIBUTE_TYPES = [
  "text",
  "number",
  "boolean",
  "select",
  "multiselect",
] as const

export const ATTRIBUTE_ROLES = ["spec", "variant"] as const

export const VARIANT_ATTRIBUTE_TYPES = ["text", "number", "select"] as const

export type AttributeType = (typeof ATTRIBUTE_TYPES)[number]

export type AttributeRole = (typeof ATTRIBUTE_ROLES)[number]

export type AttributeSort = "name" | "-name" | "createdAt" | "-createdAt"

export type Attribute = {
  id: string
  name: string
  slug: string
  description: string
  type: AttributeType
  role: AttributeRole
  valueMode: "open" | "choice"
  unit: string
  isFilterable: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ListAttributesParams = {
  page?: number
  limit?: number
  type?: AttributeType
  role?: AttributeRole
  isActive?: boolean
  search?: string
  sort?: AttributeSort
}

export type ListAttributesResult = {
  items: Attribute[]
  pagination: PaginationMeta
}

export type CreateAttributePayload = {
  name: string
  slug?: string
  description?: string
  type: AttributeType
  role: AttributeRole
  unit?: string
  isFilterable?: boolean
  isActive?: boolean
}

export type UpdateAttributePayload = {
  name?: string
  slug?: string
  description?: string
  type?: AttributeType
  role?: AttributeRole
  unit?: string
  isFilterable?: boolean
  isActive?: boolean
}
