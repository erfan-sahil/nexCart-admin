import {
  CalendarClock,
  Hash,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  UserRound,
} from "lucide-react"
import type { ReactNode } from "react"

import { UniversalBadge, badgeColors } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatBdt } from "@/features/finance/lib/format"
import { formatDateTime } from "@/lib/format"
import { ApiError } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import { useAdminStoreQuery } from "../hooks"
import { STORE_LISTING_STATUS_LABEL, storeListingStatus } from "../labels"
import type { AdminStoreSummary } from "../types"

const STATUS_BADGE: Record<
  ReturnType<typeof storeListingStatus>,
  (typeof badgeColors)[keyof typeof badgeColors]
> = {
  listed: badgeColors.active,
  suspended: badgeColors.suspended,
  closed: badgeColors.neutral,
}

type StoreDetailDialogProps = {
  store: AdminStoreSummary | null
  open: boolean
  onClose: () => void
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

function formatAddress(address: {
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}) {
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode]
      .filter(Boolean)
      .join(", "),
    address.country,
  ]
    .filter(Boolean)
    .join("\n")
}

function DetailItem({
  icon: Icon,
  label,
  value,
  tone,
  nowrap = false,
  className,
  children,
}: {
  icon: typeof Phone
  label: string
  value?: string
  tone: DetailTone
  nowrap?: boolean
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3",
        nowrap && "min-w-max flex-1",
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
      <div className={cn(nowrap ? "shrink-0" : "min-w-0 flex-1")}>
        <dt className="text-xs font-medium whitespace-nowrap text-muted-foreground">
          {label}
        </dt>
        {children ?? (
          <dd
            className={cn(
              "mt-0.5 text-sm font-medium text-foreground",
              nowrap
                ? "whitespace-nowrap"
                : "wrap-break-word whitespace-pre-wrap"
            )}
          >
            {value}
          </dd>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
}

export function StoreDetailDialog({
  store,
  open,
  onClose,
}: StoreDetailDialogProps) {
  const detailQuery = useAdminStoreQuery(store?.id ?? null, open)
  const detail = detailQuery.data
  const errorMessage =
    detailQuery.error instanceof ApiError
      ? detailQuery.error.message
      : detailQuery.isError
        ? "Could not load store details."
        : null

  if (!open || !store) {
    return null
  }

  const status = storeListingStatus(store)
  const statusColors = STATUS_BADGE[status]

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-sm ring-4 ring-background">
              {storeInitials(store.name)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {store.name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {store.slug} · Vendor storefront
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={STORE_LISTING_STATUS_LABEL[status]}
                  colors={statusColors}
                  showDot
                />
                <UniversalBadge
                  name="Store"
                  icon={Store}
                  colors={badgeColors.vendor}
                  showDot={false}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody
          scrollClassName="max-h-[calc(100dvh-16rem)] bg-muted/20"
          viewportClassName="max-h-[calc(100dvh-16rem)]"
          className="space-y-5 px-6 py-5"
        >
          {detailQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading store profile…
            </div>
          ) : errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : detail ? (
            <>
              <section className="space-y-3">
                <SectionLabel>Performance</SectionLabel>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={Package}
                    label="Products"
                    value={String(detail.totalProducts)}
                    tone="brand"
                  />
                  <DetailItem
                    icon={ShoppingBag}
                    label="Orders"
                    value={String(detail.totalOrders)}
                    tone="violet"
                  />
                  <DetailItem
                    icon={TrendingUp}
                    label="Lifetime sales"
                    value={formatBdt(detail.totalSales)}
                    tone="emerald"
                  />
                  <DetailItem
                    icon={Star}
                    label="Rating"
                    value={`${detail.rating.average.toFixed(1)} (${detail.rating.count} reviews)`}
                    tone="amber"
                  />
                </dl>
              </section>

              <section className="space-y-3">
                <SectionLabel>Contact</SectionLabel>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={Mail}
                    label="Email"
                    value={detail.contact.email || "—"}
                    tone="violet"
                    className="sm:col-span-2"
                  />
                  <DetailItem
                    icon={Phone}
                    label="Phone"
                    value={detail.contact.phone || "No phone on file"}
                    tone="emerald"
                  />
                  <DetailItem
                    icon={UserRound}
                    label="Vendor user id"
                    value={detail.userId}
                    tone="brand"
                  />
                </dl>
              </section>

              <section className="space-y-3">
                <SectionLabel>Location</SectionLabel>
                <dl className="grid gap-3">
                  <DetailItem
                    icon={MapPin}
                    label="Address"
                    value={formatAddress(detail.address) || "—"}
                    tone="brand"
                  />
                </dl>
              </section>

              <section className="space-y-3">
                <SectionLabel>Catalog</SectionLabel>
                <DetailItem icon={Layers} label="Categories" tone="violet">
                  {detail.categories.length === 0 ? (
                    <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                      None selected
                    </p>
                  ) : (
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {detail.categories.map((category) => (
                        <li key={category.id}>
                          <UniversalBadge
                            name={category.name}
                            colors={badgeColors.neutral}
                            showDot={false}
                            className="normal-case"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </DetailItem>
                {detail.description ? (
                  <DetailItem
                    icon={Store}
                    label="Description"
                    value={detail.description}
                    tone="amber"
                  />
                ) : null}
              </section>

              <section className="space-y-3">
                <SectionLabel>Record</SectionLabel>
                <dl className="flex flex-wrap gap-3">
                  <DetailItem
                    icon={CalendarClock}
                    label="Joined"
                    value={formatDateTime(detail.joinedAt)}
                    tone="brand"
                    nowrap
                  />
                  <DetailItem
                    icon={Hash}
                    label="Store id"
                    value={detail.id}
                    tone="emerald"
                    nowrap
                  />
                </dl>
              </section>
            </>
          ) : null}
        </DialogBody>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
