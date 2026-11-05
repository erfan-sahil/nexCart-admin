"use client"

import {
  ArrowDownToLine,
  BadgePercent,
  Clock3,
  Landmark,
  Percent,
  Store,
  Wallet,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import { BalanceMixBar } from "./finance-ui"
import { ReleaseSettlementDialog } from "./release-settlement-dialog"
import { formatBdt } from "../lib/format"
import type { VendorEarningsRow } from "../services/admin-finance.api"

type VendorEarningsDetailsDialogProps = {
  store: VendorEarningsRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBalancesChanged?: () => void
}

type DetailTone = "brand" | "emerald" | "amber" | "violet"

const TONE_CLASS: Record<DetailTone, string> = {
  brand: "bg-brand/15 text-brand-text",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

function storeInitials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: typeof Wallet
  label: string
  value: string
  tone: DetailTone
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3",
        className
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium whitespace-nowrap text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-medium wrap-break-word text-foreground tabular-nums">
          {value}
        </dd>
      </div>
    </div>
  )
}

export function VendorEarningsDetailsDialog({
  store,
  open,
  onOpenChange,
  onBalancesChanged,
}: VendorEarningsDetailsDialogProps) {
  const [releaseOpen, setReleaseOpen] = useState(false)

  if (!open || !store) {
    return null
  }

  const total = store.totalBalance
  const liveBalance = store.pendingSettlement + store.availableBalance
  const canMakeEligible = store.pendingSettlement > 0

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            onOpenChange(false)
          }
        }}
      >
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
            <div className="flex items-center gap-4 pr-8">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-sm ring-4 ring-background">
                {storeInitials(store.storeName)}
              </span>
              <div className="min-w-0">
                <DialogTitle className="truncate text-lg font-semibold">
                  {store.storeName}
                </DialogTitle>
                <DialogDescription className="mt-1 truncate font-mono text-xs text-foreground/70">
                  {store.storeId}
                </DialogDescription>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <UniversalBadge
                    name="Vendor store"
                    icon={Store}
                    colors={badgeColors.vendor}
                    showDot={false}
                  />
                  <UniversalBadge
                    name={store.hasOverride ? "Custom rate" : "Default rate"}
                    icon={BadgePercent}
                    colors={
                      store.hasOverride
                        ? badgeColors.under_review
                        : badgeColors.neutral
                    }
                    showDot={false}
                  />
                </div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea
            type="auto"
            className="max-h-[calc(100dvh-16rem)] bg-muted/20"
            viewportClassName="max-h-[calc(100dvh-16rem)]"
          >
            <div className="space-y-5 px-6 py-5">
              <section className="space-y-3">
                <SectionLabel>Balances</SectionLabel>
                <div className="rounded-xl border border-border/80 bg-card px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Live balance mix
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatBdt(liveBalance)} active
                    </p>
                  </div>
                  <div className="mt-3 max-w-none [&_div]:max-w-none">
                    <BalanceMixBar
                      pending={store.pendingSettlement}
                      available={store.availableBalance}
                      withdrawn={store.withdrawnBalance}
                    />
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-500/80" />
                      Pending {formatBdt(store.pendingSettlement)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500/80" />
                      Available {formatBdt(store.availableBalance)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-sky-500/70" />
                      Withdrawn {formatBdt(store.withdrawnBalance)}
                    </span>
                  </div>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={Clock3}
                    label="Pending settlement"
                    value={formatBdt(store.pendingSettlement)}
                    tone="amber"
                  />
                  <DetailItem
                    icon={Wallet}
                    label="Available to withdraw"
                    value={formatBdt(store.availableBalance)}
                    tone="emerald"
                  />
                  <DetailItem
                    icon={ArrowDownToLine}
                    label="Withdrawn"
                    value={formatBdt(store.withdrawnBalance)}
                    tone="violet"
                  />
                  <DetailItem
                    icon={Landmark}
                    label="Total tracked"
                    value={formatBdt(total)}
                    tone="brand"
                  />
                </dl>
              </section>

              <section className="space-y-3">
                <SectionLabel>Withdrawal eligibility</SectionLabel>
                <div className="rounded-xl border border-border/80 bg-card px-3.5 py-3">
                  <p className="text-sm text-muted-foreground">
                    Automatic settlement still moves funds after delivery,
                    payment clearance, and the hold window. Use admin release to
                    make this vendor eligible for withdrawal early.
                  </p>
                  <Button
                    type="button"
                    className="mt-3 cursor-pointer"
                    disabled={!canMakeEligible}
                    onClick={() => setReleaseOpen(true)}
                  >
                    Make eligible for withdrawal
                  </Button>
                  {!canMakeEligible ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      No pending settlement left to release for this store.
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="space-y-3">
                <SectionLabel>Commission</SectionLabel>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={Percent}
                    label="Effective rate"
                    value={`${store.effectiveCommissionRate}%`}
                    tone="brand"
                  />
                  <DetailItem
                    icon={BadgePercent}
                    label="Rate source"
                    value={
                      store.hasOverride
                        ? `Store override${
                            store.commissionRate != null
                              ? ` · ${store.commissionRate}%`
                              : ""
                          }`
                        : "Platform default"
                    }
                    tone={store.hasOverride ? "amber" : "emerald"}
                  />
                </dl>
              </section>
            </div>
          </ScrollArea>

          <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button type="button" className="cursor-pointer" asChild>
              <Link to="/finance/commissions">
                <Percent />
                Manage rates
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReleaseSettlementDialog
        store={store}
        open={releaseOpen}
        onOpenChange={setReleaseOpen}
        onReleased={() => {
          onBalancesChanged?.()
          onOpenChange(false)
        }}
      />
    </>
  )
}
