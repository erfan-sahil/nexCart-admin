"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  BadgePercent,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Percent,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api/errors"

import {
  BalanceMixBar,
  FinanceLayout,
  FinancePageIntro,
  FinanceSection,
  FinanceStatCard,
  FinanceStatGrid,
  FinanceStatSkeleton,
  FinanceTableSkeleton,
  StoreAvatar,
} from "./finance-ui"
import { sumVendorEarnings } from "../lib/aggregates"
import { formatBdt } from "../lib/format"
import {
  getCommissionSettings,
  listVendorEarnings,
  setStoreCommission,
  updateCommissionSettings,
} from "../services/admin-finance.api"

export function AdminCommissionsPage() {
  const settings = useQuery({
    queryKey: ["admin", "commission", "settings"],
    queryFn: getCommissionSettings,
  })
  const earnings = useQuery({
    queryKey: ["admin", "commission", "vendor-earnings"],
    queryFn: () => listVendorEarnings(1, 50),
  })

  const queryClient = useQueryClient()
  const [rate, setRate] = useState<number | "">("")
  const [holdDays, setHoldDays] = useState<number | "">("")
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [storeId, setStoreId] = useState("")
  const [storeRate, setStoreRate] = useState<number | "">("")
  const [overrideError, setOverrideError] = useState<string | null>(null)
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null)

  const saveSettings = useMutation({
    mutationFn: updateCommissionSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "commission"] })
      setRate("")
      setHoldDays("")
    },
  })

  const saveStoreRate = useMutation({
    mutationFn: (payload: { storeId: string; commissionRate: number | null }) =>
      setStoreCommission(payload.storeId, payload.commissionRate),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "commission"] })
      setOverrideSuccess(
        data.storeName
          ? `Updated rate for ${data.storeName}.`
          : "Store commission updated."
      )
      setOverrideError(null)
      setStoreId("")
      setStoreRate("")
    },
  })

  if (settings.isLoading) {
    return (
      <FinanceLayout>
        <FinanceStatSkeleton />
      </FinanceLayout>
    )
  }

  const current = settings.data
  const items = earnings.data?.items ?? []
  const totals = sumVendorEarnings(items)
  const effectiveRate =
    rate !== "" ? rate : (current?.defaultCommissionRate ?? 10)
  const effectiveHold =
    holdDays !== "" ? holdDays : (current?.settlementHoldDays ?? 7)

  return (
    <FinanceLayout>
      <FinancePageIntro
        title="Commissions"
        description="Set the platform default fee and settlement hold. Per-store overrides apply when a custom rate is saved for that store."
        aside={
          <Button variant="outline" size="sm" asChild>
            <Link to="/finance/settlements">Settlements overview</Link>
          </Button>
        }
      />

      <FinanceStatGrid>
        <FinanceStatCard
          icon={Percent}
          tone="brand"
          label="Default commission"
          value={`${current?.defaultCommissionRate ?? 10}%`}
          detail="Applied to vendor orders unless a store override exists"
        />
        <FinanceStatCard
          icon={CalendarClock}
          tone="warning"
          label="Settlement hold"
          value={`${current?.settlementHoldDays ?? 7} days`}
          detail="Earnings stay pending until the hold window passes"
        />
        <FinanceStatCard
          icon={BadgePercent}
          tone="info"
          label="Vendor pending"
          value={formatBdt(totals.pendingSettlement)}
          detail={`Across ${totals.storeCount} active stores`}
        />
        <FinanceStatCard
          icon={CheckCircle2}
          tone="success"
          label="Available to withdraw"
          value={formatBdt(totals.availableBalance)}
          detail="Released balances vendors can request"
        />
      </FinanceStatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <FinanceSection
          title="Platform defaults"
          description="Changes apply to new commission calculations."
        >
          <form
            className="space-y-4 px-4 py-4 sm:px-5"
            onSubmit={async (event) => {
              event.preventDefault()
              setSettingsError(null)
              try {
                await saveSettings.mutateAsync({
                  defaultCommissionRate: Number(effectiveRate),
                  settlementHoldDays: Number(effectiveHold),
                })
              } catch (err) {
                setSettingsError(
                  err instanceof ApiError
                    ? err.message
                    : "Could not save settings."
                )
              }
            }}
          >
            <FieldGroup className="gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="defaultRate">
                  Default commission (%)
                </FieldLabel>
                <Input
                  id="defaultRate"
                  type="number"
                  min={0}
                  max={100}
                  placeholder={String(current?.defaultCommissionRate ?? 10)}
                  value={rate}
                  onChange={(e) =>
                    setRate(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="holdDays">
                  Settlement hold (days)
                </FieldLabel>
                <Input
                  id="holdDays"
                  type="number"
                  min={0}
                  max={90}
                  placeholder={String(current?.settlementHoldDays ?? 7)}
                  value={holdDays}
                  onChange={(e) =>
                    setHoldDays(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </Field>
            </FieldGroup>
            {settingsError ? (
              <p className="text-sm text-destructive">{settingsError}</p>
            ) : null}
            <Button type="submit" disabled={saveSettings.isPending}>
              {saveSettings.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save platform settings"
              )}
            </Button>
          </form>
        </FinanceSection>

        <FinanceSection
          title="Store override"
          description="Paste a store id and optional custom rate. Leave rate empty and save to clear an override."
        >
          <form
            className="space-y-4 px-4 py-4 sm:px-5"
            onSubmit={async (event) => {
              event.preventDefault()
              setOverrideError(null)
              setOverrideSuccess(null)
              const trimmedId = storeId.trim()

              if (!trimmedId) {
                setOverrideError("Store id is required.")
                return
              }

              try {
                await saveStoreRate.mutateAsync({
                  storeId: trimmedId,
                  commissionRate: storeRate === "" ? null : Number(storeRate),
                })
              } catch (err) {
                setOverrideError(
                  err instanceof ApiError
                    ? err.message
                    : "Could not update store commission."
                )
              }
            }}
          >
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="storeId">Store id</FieldLabel>
                <Input
                  id="storeId"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  placeholder="MongoDB store id"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="storeRate">
                  Custom rate (%) — optional
                </FieldLabel>
                <Input
                  id="storeRate"
                  type="number"
                  min={0}
                  max={100}
                  value={storeRate}
                  onChange={(e) =>
                    setStoreRate(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Clear override when empty on save"
                />
              </Field>
            </FieldGroup>
            {overrideError ? (
              <p className="text-sm text-destructive">{overrideError}</p>
            ) : null}
            {overrideSuccess ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {overrideSuccess}
              </p>
            ) : null}
            <Button
              type="submit"
              variant="secondary"
              disabled={saveStoreRate.isPending}
            >
              Apply store override
            </Button>
          </form>
        </FinanceSection>
      </div>

      <FinanceSection
        title="Vendor balances"
        description="Snapshot of pending settlement and withdrawable balances."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/finance/vendor-earnings">View all stores</Link>
          </Button>
        }
        noPadding
      >
        {earnings.isLoading ? (
          <FinanceTableSkeleton />
        ) : items.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-5">
            No active stores with wallet data yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Mix</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Withdrawn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.slice(0, 8).map((row) => (
                  <TableRow key={row.storeId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <StoreAvatar name={row.storeName} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {row.storeName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {row.storeId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <BalanceMixBar
                        pending={row.pendingSettlement}
                        available={row.availableBalance}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatBdt(row.pendingSettlement)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatBdt(row.availableBalance)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {formatBdt(row.withdrawnBalance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </FinanceSection>
    </FinanceLayout>
  )
}
