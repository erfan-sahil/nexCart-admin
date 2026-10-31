import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type { Category, CategoryTreeNode } from "../categories/types"

export type FeaturedCategory = Category & {
  productCount: number
}

export async function listFeaturedCategories() {
  try {
    const { data } = await api.get<ApiSuccess<FeaturedCategory[]>>(
      "/categories/featured"
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listRootCategories() {
  try {
    const { data } = await api.get<ApiSuccess<CategoryTreeNode[]>>(
      "/categories/tree",
      { params: { isActive: true } }
    )
    return data.data.filter((node) => node.level === 1)
  } catch (error) {
    throw toApiError(error)
  }
}

export async function setCategoryFeatured(id: string, isFeatured: boolean) {
  try {
    const { data } = await api.patch<ApiSuccess<Category>>(
      `/categories/${id}/featured`,
      { isFeatured }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateFeaturedCategoryOrder(categoryIds: string[]) {
  try {
    const { data } = await api.patch<ApiSuccess<FeaturedCategory[]>>(
      "/categories/featured-order",
      { categoryIds }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
