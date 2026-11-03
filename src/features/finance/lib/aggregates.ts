import type {
  VendorEarningsRow,
  WithdrawalRow,
} from "../services/admin-finance.api"

export type VendorEarningsTotals = {
  pendingSettlement: number
  availableBalance: number
  withdrawnBalance: number
  storeCount: number
}

export function sumVendorEarnings(
  items: VendorEarningsRow[]
): VendorEarningsTotals {
  return items.reduce(
    (acc, row) => ({
      pendingSettlement: acc.pendingSettlement + row.pendingSettlement,
      availableBalance: acc.availableBalance + row.availableBalance,
      withdrawnBalance: acc.withdrawnBalance + row.withdrawnBalance,
      storeCount: acc.storeCount + 1,
    }),
    {
      pendingSettlement: 0,
      availableBalance: 0,
      withdrawnBalance: 0,
      storeCount: 0,
    }
  )
}

export function sumWithdrawalAmount(items: WithdrawalRow[]) {
  return items.reduce((total, row) => total + row.amount, 0)
}
