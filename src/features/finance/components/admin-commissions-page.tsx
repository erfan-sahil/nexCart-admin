"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  BadgePercent,
  CalendarClock,
  Loader2,
  Pencil,
  Percent,
  Store,
} from "@/lib/icons"
import { useMemo, useState } from "react"
import { Link } from "react-router"

import { badgeColors, UniversalBadge } from "@/components/shared"
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

import { EditStoreCommissionDialog } from "./edit-store-commission-dialog"
import {
  FinanceLayout,
  FinancePageIntro,
  FinanceSection,
  FinanceStatCard,
  FinanceStatGrid,
  FinanceStatSkeleton,
  FinanceTableSkeleton,
  StoreAvatar,
} from "./finance-ui"
import {
  getCommissionSettings,
  listVendorEarnings,
  updateCommissionSettings,
  type VendorEarningsRow,
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
  const [editTarget, setEditTarget] = useState<VendorEarningsRow | null>(null)

  const saveSettings = useMutation({
    mutationFn: updateCommissionSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "commission"] })
      setRate("")
      setHoldDays("")
    },
  })

  const items = useMemo(
    () => earnings.data?.items ?? [],
    [earnings.data?.items]
  )
  const overrideCount = useMemo(
    () => items.filter((row) => row.hasOverride).length,
    [items]
  )

  if (settings.isLoading) {
    return (
      <FinanceLayout>
        <FinanceStatSkeleton />
      </FinanceLayout>
    )
  }

  const current = settings.data
  const defaultCommissionRate = current?.defaultCommissionRate ?? 10
  const effectiveRate = rate !== "" ? rate : defaultCommissionRate
  const effectiveHold =
    holdDays !== "" ? holdDays : (current?.settlementHoldDays ?? 7)

  return (
    <FinanceLayout>
      <FinancePageIntro
        title="Commissions"
        description="Set the platform default fee and settlement hold, then override rates for individual stores."
        aside={
          <Button variant="outline" size="sm" asChild>
            <Link to="/finance/vendor-earnings">Vendor earnings</Link>
          </Button>
        }
      />

      <FinanceStatGrid>
        <FinanceStatCard
          icon={Percent}
          tone="brand"
          label="Default commission"
          value={`${defaultCommissionRate}%`}
          detail="Applied unless a store has a custom override"
        />
        <FinanceStatCard
          icon={CalendarClock}
          tone="warning"
          label="Settlement hold"
          value={`${current?.settlementHoldDays ?? 7} days`}
          detail="How long earnings stay pending before release"
        />
        <FinanceStatCard
          icon={BadgePercent}
          tone="info"
          label="Custom overrides"
          value={String(overrideCount)}
          detail={`Of ${items.length} stores on this list`}
        />
        <FinanceStatCard
          icon={Store}
          tone="success"
          label="Using default"
          value={String(Math.max(items.length - overrideCount, 0))}
          detail="Stores billed at the platform rate"
        />
      </FinanceStatGrid>

      <div className="grid gap-4 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] lg:items-start">
        <FinanceSection
          title="Platform defaults"
          description="Changes apply to new commission calculations only."
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
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="defaultRate">
                  Default commission (%)
                </FieldLabel>
                <Input
                  id="defaultRate"
                  type="number"
                  min={0}
                  max={100}
                  placeholder={String(defaultCommissionRate)}
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
          title="Store commission rates"
          description="Override the platform fee for a specific store. Balances live on Vendor earnings."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/finance/vendor-earnings">View balances</Link>
            </Button>
          }
          noPadding
        >
          {earnings.isLoading ? (
            <FinanceTableSkeleton />
          ) : items.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-5">
              No active stores yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-[1%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
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
                      <TableCell className="font-medium tabular-nums">
                        {row.effectiveCommissionRate}%
                      </TableCell>
                      <TableCell>
                        <UniversalBadge
                          name={row.hasOverride ? "Override" : "Default"}
                          colors={
                            row.hasOverride
                              ? badgeColors.under_review
                              : badgeColors.neutral
                          }
                          showDot={false}
                          className="normal-case"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditTarget(row)}
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </FinanceSection>
      </div>

      <EditStoreCommissionDialog
        store={editTarget}
        defaultCommissionRate={defaultCommissionRate}
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null)
          }
        }}
      />
    </FinanceLayout>
  )
}
