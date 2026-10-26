import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type {
  ListVendorApplicationsParams,
  ListVendorApplicationsResult,
  VendorApplication,
  VendorApplicationSummary,
} from "../types"

type CategoryTreeNode = {
  id: string
  name: string
  children: CategoryTreeNode[]
}

function cleanParams(params: ListVendorApplicationsParams) {
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

function optionalNote(note?: string) {
  const trimmed = note?.trim() ?? ""

  return trimmed ? { note: trimmed } : {}
}

export async function listVendorApplications(
  params: ListVendorApplicationsParams = {}
): Promise<ListVendorApplicationsResult> {
  try {
    const { data } = await api.get<ApiSuccess<VendorApplicationSummary[]>>(
      "/vendor-applications",
      { params: cleanParams(params) }
    )

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

export async function getVendorApplication(id: string) {
  try {
    const { data } = await api.get<ApiSuccess<VendorApplication>>(
      `/vendor-applications/${id}`
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function startVendorApplicationReview(id: string, note?: string) {
  try {
    const { data } = await api.post<ApiSuccess<VendorApplication>>(
      `/vendor-applications/${id}/review`,
      optionalNote(note)
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function requestVendorApplicationInfo(id: string, note: string) {
  try {
    const { data } = await api.post<ApiSuccess<VendorApplication>>(
      `/vendor-applications/${id}/request-info`,
      { note: note.trim() }
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function approveVendorApplication(id: string, note?: string) {
  try {
    const { data } = await api.post<ApiSuccess<VendorApplication>>(
      `/vendor-applications/${id}/approve`,
      optionalNote(note)
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function rejectVendorApplication(id: string, note: string) {
  try {
    const { data } = await api.post<ApiSuccess<VendorApplication>>(
      `/vendor-applications/${id}/reject`,
      { note: note.trim() }
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listCategoryNames() {
  try {
    const { data } =
      await api.get<ApiSuccess<CategoryTreeNode[]>>("/categories/tree")
    const names = new Map<string, string>()

    const walk = (nodes: CategoryTreeNode[]) => {
      for (const node of nodes) {
        names.set(node.id, node.name)
        walk(node.children ?? [])
      }
    }

    walk(data.data)

    return names
  } catch (error) {
    throw toApiError(error)
  }
}
