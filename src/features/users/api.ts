import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type {
  AdminUser,
  ListUsersParams,
  ListUsersResult,
  UpdateUserPayload,
} from "./types"

function cleanParams(params: ListUsersParams) {
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

export async function listUsers(
  params: ListUsersParams = {}
): Promise<ListUsersResult> {
  try {
    const { data } = await api.get<ApiSuccess<AdminUser[]>>("/users", {
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

export async function updateUser(id: string, payload: UpdateUserPayload) {
  try {
    const { data } = await api.patch<ApiSuccess<AdminUser>>("/users", payload, {
      params: { id },
    })

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function deleteUser(id: string) {
  try {
    const { data } = await api.delete<ApiSuccess<{ id: string }>>("/users", {
      params: { id },
    })

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
