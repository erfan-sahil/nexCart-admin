import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type {
  Category,
  CategoryTreeNode,
  CreateCategoryPayload,
  ListCategoriesParams,
  ListCategoriesResult,
  UpdateCategoryPayload,
} from "../types"

function cleanParams(params: ListCategoriesParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false
      }

      if (typeof value === "string" && value.trim() === "") {
        return false
      }

      return true
    })
  )
}

export async function listCategories(
  params: ListCategoriesParams = {}
): Promise<ListCategoriesResult> {
  try {
    const { data } = await api.get<ApiSuccess<Category[]>>("/categories", {
      params: cleanParams(params),
    })

    return {
      items: data.data,
      pagination: data.meta?.pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        total: data.data.length,
        totalPages: 1,
      },
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listCategoryTree() {
  try {
    const { data } =
      await api.get<ApiSuccess<CategoryTreeNode[]>>("/categories/tree")

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function uploadCategoryImage(file: File) {
  const body = new FormData()
  body.append("image", file, file.name)

  try {
    const { data } = await api.post<ApiSuccess<{ url: string }>>(
      "/categories/image",
      body,
      {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (payload, headers) => {
          if (
            headers &&
            typeof headers === "object" &&
            "delete" in headers &&
            typeof headers.delete === "function"
          ) {
            headers.delete("Content-Type")
          }

          return payload
        },
      }
    )

    return data.data.url
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createCategory(payload: CreateCategoryPayload) {
  try {
    const { data } = await api.post<ApiSuccess<Category>>(
      "/categories",
      payload
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload
) {
  try {
    const { data } = await api.patch<ApiSuccess<Category>>(
      `/categories/${id}`,
      payload
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function deleteCategory(id: string) {
  try {
    const { data } = await api.delete<ApiSuccess<{ id: string }>>(
      `/categories/${id}`
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
