import type { PaginationMeta } from "@/lib/api/types"

export const CATEGORY_LEVELS = [1, 2, 3] as const

export type CategoryLevel = (typeof CATEGORY_LEVELS)[number]

export type CategorySort =
  "sortOrder" | "-sortOrder" | "name" | "-name" | "createdAt" | "-createdAt"

export type Category = {
  id: string
  name: string
  slug: string
  description: string
  image: string
  parentId: string | null
  ancestors: string[]
  level: CategoryLevel
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[]
}

export type ListCategoriesParams = {
  page?: number
  limit?: number
  level?: CategoryLevel
  parentId?: string
  isActive?: boolean
  search?: string
  sort?: CategorySort
}

export type ListCategoriesResult = {
  items: Category[]
  pagination: PaginationMeta
}

export type CreateCategoryPayload = {
  name: string
  slug?: string
  description?: string
  image?: string
  parentId?: string | null
  isActive?: boolean
  sortOrder?: number
}

export type UpdateCategoryPayload = {
  name?: string
  slug?: string
  description?: string
  image?: string
  parentId?: string | null
  isActive?: boolean
  sortOrder?: number
}
