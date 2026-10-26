import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type {
  Attribute,
  CreateAttributePayload,
  ListAttributesParams,
  ListAttributesResult,
  UpdateAttributePayload,
} from "../types"

function cleanParams(params: ListAttributesParams) {
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

export async function listAttributes(
  params: ListAttributesParams = {}
): Promise<ListAttributesResult> {
  try {
    const { data } = await api.get<ApiSuccess<Attribute[]>>("/attributes", {
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

export async function createAttribute(payload: CreateAttributePayload) {
  try {
    const { data } = await api.post<ApiSuccess<Attribute>>(
      "/attributes",
      payload
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateAttribute(
  id: string,
  payload: UpdateAttributePayload
) {
  try {
    const { data } = await api.patch<ApiSuccess<Attribute>>(
      `/attributes/${id}`,
      payload
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function deleteAttribute(id: string) {
  try {
    const { data } = await api.delete<ApiSuccess<{ id: string }>>(
      `/attributes/${id}`
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
