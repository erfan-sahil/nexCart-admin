import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

export type CommissionSettings = {
  defaultCommissionRate: number
  settlementHoldDays: number
}

export type VendorEarningsRow = {
  storeId: string
  storeName: string
  pendingSettlement: number
  availableBalance: number
  withdrawnBalance: number
}

export type WithdrawalRow = {
  id: string
  storeId?: string
  amount: number
  status: string
  method: string
  accountHolderName?: string
  accountNumber?: string
  payoutReference?: string
  reviewNote?: string
  createdAt: string
}

export async function getCommissionSettings(): Promise<CommissionSettings> {
  try {
    const { data } = await api.get<ApiSuccess<CommissionSettings>>(
      "/admin/commission/settings"
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateCommissionSettings(
  payload: CommissionSettings
): Promise<CommissionSettings> {
  try {
    const { data } = await api.put<ApiSuccess<CommissionSettings>>(
      "/admin/commission/settings",
      payload
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function setStoreCommission(
  storeId: string,
  commissionRate: number | null
) {
  try {
    const { data } = await api.patch<
      ApiSuccess<{
        storeId: string
        storeName?: string
        commissionRate?: number | null
      }>
    >(`/admin/commission/stores/${storeId}`, { commissionRate })
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listVendorEarnings(page = 1, limit = 20) {
  try {
    const { data } = await api.get<ApiSuccess<VendorEarningsRow[]>>(
      "/admin/commission/vendor-earnings",
      { params: { page, limit } }
    )
    return {
      items: data.data,
      pagination: data.meta?.pagination as PaginationMeta,
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listAdminWithdrawals(params: {
  page?: number
  limit?: number
  status?: string
}) {
  try {
    const { data } = await api.get<ApiSuccess<WithdrawalRow[]>>(
      "/admin/withdrawals",
      { params }
    )
    return {
      items: data.data,
      pagination: data.meta?.pagination as PaginationMeta,
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function reviewWithdrawal(
  withdrawalId: string,
  body: {
    action: "approve" | "reject" | "processing" | "paid"
    reviewNote?: string
    payoutReference?: string
  }
) {
  try {
    const { data } = await api.post<ApiSuccess<WithdrawalRow>>(
      `/admin/withdrawals/${withdrawalId}/review`,
      body
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getFinanceReportSummary() {
  try {
    const { data } = await api.get<
      ApiSuccess<{
        gmvFromVendorOrders: number
        commissionFromSnapshots: number
        commissionFromLedger: number
        codOrdersOutstanding: number
      }>
    >("/admin/finance/reports/summary")
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
