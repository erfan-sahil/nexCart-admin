"use client"

import { useQuery } from "@tanstack/react-query"
import {
  BadgePercent,
  Banknote,
  CircleDollarSign,
  Landmark,
  Package,
  Scale,
  Wallet,
} from "lucide-react"

import { ApiError } from "@/lib/api/errors"

import {
  FinanceInlineNav,
  FinanceLayout,
  FinancePageIntro,
  FinanceSection,
  FinanceStatCard,
  FinanceStatGrid,
  FinanceStatSkeleton,
} from "./finance-ui"
import { sumVendorEarnings, sumWithdrawalAmount } from "../lib/aggregates"
import { formatBdt } from "../lib/format"
import {
  getFinanceReportSummary,
  listAdminWithdrawals,
  listVendorEarnings,
} from "../services/admin-finance.api"

const FINANCE_LINKS = [
  { label: "Commissions", to: "/finance/commissions" },
  { label: "Vendor earnings", to: "/finance/vendor-earnings" },
  { label: "Withdrawals", to: "/finance/withdrawals" },
]

export function AdminSettlementsPage() {
  const summary = useQuery({
    queryKey: ["admin", "finance", "summary"],
    queryFn: getFinanceReportSummary,
  })
  const earnings = useQuery({
    queryKey: ["admin", "finance", "earnings-totals"],
    queryFn: () => listVendorEarnings(1, 100),
  })
  const pendingWithdrawals = useQuery({
    queryKey: ["admin", "finance", "pending-withdrawals"],
    queryFn: () =>
      listAdminWithdrawals({ page: 1, limit: 100, status: "pending" }),
  })

  const loading =
    summary.isLoading || earnings.isLoading || pendingWithdrawals.isLoading

  const report = summary.data
  const vendorTotals = sumVendorEarnings(earnings.data?.items ?? [])
  const pendingItems = pendingWithdrawals.data?.items ?? []
  const pendingWithdrawalTotal = sumWithdrawalAmount(pendingItems)
  const pendingWithdrawalCount =
    pendingWithdrawals.data?.pagination?.total ?? pendingItems.length

  const ledgerDelta =
    report != null
      ? report.commissionFromLedger - report.commissionFromSnapshots
      : 0

  const errorMessage =
    summary.error instanceof ApiError
      ? summary.error.message
      : summary.isError
        ? "Could not load finance summary."
        : null

  return (
    <FinanceLayout>
      <FinancePageIntro
        title="Settlements overview"
        description="Platform GMV, commission totals, COD exposure, and live vendor wallet aggregates."
        aside={<FinanceInlineNav items={FINANCE_LINKS} />}
      />

      {loading ? (
        <FinanceStatSkeleton />
      ) : errorMessage ? (
        <FinanceSection title="Summary unavailable">
          <p className="px-4 py-8 text-center text-sm text-destructive sm:px-5">
            {errorMessage}
          </p>
        </FinanceSection>
      ) : (
        <>
          <FinanceStatGrid>
            <FinanceStatCard
              icon={Landmark}
              tone="brand"
              label="GMV (vendor orders)"
              value={formatBdt(report?.gmvFromVendorOrders ?? 0)}
              detail="Items subtotal on orders with a commission snapshot"
            />
            <FinanceStatCard
              icon={BadgePercent}
              tone="success"
              label="Commission (snapshots)"
              value={formatBdt(report?.commissionFromSnapshots ?? 0)}
              detail="Sum of commission amounts stored on vendor orders"
            />
            <FinanceStatCard
              icon={Scale}
              tone="info"
              label="Commission (ledger)"
              value={formatBdt(report?.commissionFromLedger ?? 0)}
              detail="Commission debits recorded in the wallet ledger"
            />
            <FinanceStatCard
              icon={Package}
              tone="warning"
              label="COD orders tracked"
              value={String(report?.codOrdersOutstanding ?? 0)}
              detail="Orders with COD remittance still in flight"
            />
          </FinanceStatGrid>

          <div className="grid gap-4 lg:grid-cols-2">
            <FinanceSection
              title="Vendor wallet totals"
              description="Aggregated from active stores (first 100 in list)."
            >
              <dl className="grid gap-4 px-4 py-4 sm:grid-cols-3 sm:px-5">
                <Metric
                  label="Pending settlement"
                  value={formatBdt(vendorTotals.pendingSettlement)}
                />
                <Metric
                  label="Available balance"
                  value={formatBdt(vendorTotals.availableBalance)}
                />
                <Metric
                  label="Active stores"
                  value={String(vendorTotals.storeCount)}
                />
              </dl>
            </FinanceSection>

            <FinanceSection
              title="Withdrawal pipeline"
              description="Pending payout requests awaiting admin review."
            >
              <dl className="grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
                <Metric
                  label="Pending requests"
                  value={String(pendingWithdrawalCount)}
                />
                <Metric
                  label="Pending amount"
                  value={formatBdt(pendingWithdrawalTotal)}
                />
              </dl>
            </FinanceSection>
          </div>

          <FinanceSection
            title="Commission reconciliation"
            description="Snapshot totals should align with ledger debits as orders settle."
          >
            <div className="space-y-4 px-4 py-4 sm:px-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <CompareBar
                  label="Order snapshots"
                  amount={report?.commissionFromSnapshots ?? 0}
                  max={Math.max(
                    report?.commissionFromSnapshots ?? 0,
                    report?.commissionFromLedger ?? 0,
                    1
                  )}
                  tone="brand"
                />
                <CompareBar
                  label="Ledger debits"
                  amount={report?.commissionFromLedger ?? 0}
                  max={Math.max(
                    report?.commissionFromSnapshots ?? 0,
                    report?.commissionFromLedger ?? 0,
                    1
                  )}
                  tone="success"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Ledger minus snapshots:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {formatBdt(ledgerDelta)}
                </span>
                {ledgerDelta === 0
                  ? " · figures match."
                  : " · investigate unsettled or reversed orders if this stays large."}
              </p>
            </div>
          </FinanceSection>

          <FinanceStatGrid>
            <FinanceStatCard
              icon={Wallet}
              tone="neutral"
              label="Vendor pending"
              value={formatBdt(vendorTotals.pendingSettlement)}
              detail="Held until settlement release"
            />
            <FinanceStatCard
              icon={CircleDollarSign}
              tone="success"
              label="Vendor available"
              value={formatBdt(vendorTotals.availableBalance)}
              detail="Ready for withdrawal"
            />
            <FinanceStatCard
              icon={Banknote}
              tone="warning"
              label="Withdrawals waiting"
              value={formatBdt(pendingWithdrawalTotal)}
              detail={`${pendingWithdrawalCount} open requests`}
            />
          </FinanceStatGrid>
        </>
      )}
    </FinanceLayout>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tracking-tight tabular-nums">
        {value}
      </dd>
    </div>
  )
}

function CompareBar({
  label,
  amount,
  max,
  tone,
}: {
  label: string
  amount: number
  max: number
  tone: "brand" | "success"
}) {
  const width = Math.max(4, Math.round((amount / max) * 100))

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="text-foreground tabular-nums">
          {formatBdt(amount)}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={
            tone === "brand"
              ? "h-full rounded-full bg-primary"
              : "h-full rounded-full bg-emerald-500"
          }
          style={{
            width: `${width}%`,
            backgroundImage:
              tone === "brand"
                ? "linear-gradient(to right, var(--brand-deep), var(--brand))"
                : undefined,
          }}
        />
      </div>
    </div>
  )
}
