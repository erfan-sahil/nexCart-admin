import { Ban, CircleCheck, Loader2, Trash2 } from "lucide-react"
import type { ReactNode } from "react"

import { UniversalBadge, badgeColors } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StoreAvatar } from "@/features/finance/components/finance-ui"
import { formatBdt } from "@/features/finance/lib/format"
import { formatDate } from "@/lib/format"
import { ApiError } from "@/lib/api/errors"

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
  onBan: () => void
  onDelete: () => void
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

export function StoreDetailDialog({
  store,
  open,
  onClose,
  onBan,
  onDelete,
}: StoreDetailDialogProps) {
  const detailQuery = useAdminStoreQuery(store?.id ?? null, open)
  const detail = detailQuery.data
  const status = store ? storeListingStatus(store) : "listed"
  const errorMessage =
    detailQuery.error instanceof ApiError
      ? detailQuery.error.message
      : detailQuery.isError
        ? "Could not load store details."
        : null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (!next ? onClose() : undefined)}
    >
      <DialogContent className="max-h-[min(90vh,720px)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Store details</DialogTitle>
          <DialogDescription>
            Public storefront profile and marketplace visibility.
          </DialogDescription>
        </DialogHeader>

        {store ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <StoreAvatar name={store.name} />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-base font-semibold">{store.name}</p>
                <p className="text-xs text-muted-foreground">{store.slug}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <UniversalBadge
                    name={STORE_LISTING_STATUS_LABEL[status]}
                    colors={STATUS_BADGE[status]}
                    showDot
                  />
                  <span className="text-xs text-muted-foreground">
                    Vendor {store.userId}
                  </span>
                </div>
              </div>
            </div>

            {detailQuery.isLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading profile…
              </div>
            ) : errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : detail ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Stat label="Products" value={String(detail.totalProducts)} />
                  <Stat label="Orders" value={String(detail.totalOrders)} />
                  <Stat
                    label="Lifetime sales"
                    value={formatBdt(detail.totalSales)}
                  />
                  <Stat
                    label="Rating"
                    value={`${detail.rating.average.toFixed(1)} (${detail.rating.count})`}
                  />
                </div>

                <Section title="Contact">
                  <p className="text-sm">{detail.contact.email || "—"}</p>
                  <p className="text-sm">{detail.contact.phone || "—"}</p>
                </Section>

                <Section title="Address">
                  <p className="text-sm whitespace-pre-wrap">
                    {formatAddress(detail.address) || "—"}
                  </p>
                </Section>

                <Section title="Categories">
                  {detail.categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      None selected
                    </p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
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
                </Section>

                {detail.description ? (
                  <Section title="Description">
                    <p className="text-sm whitespace-pre-wrap">
                      {detail.description}
                    </p>
                  </Section>
                ) : null}

                <p className="text-xs text-muted-foreground">
                  Joined {formatDate(detail.joinedAt)} · Store id {detail.id}
                </p>
              </>
            ) : null}
          </div>
        ) : null}

        {store && detail && !detailQuery.isLoading && !errorMessage ? (
          <DialogFooter className="flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onDelete}
            >
              <Trash2 />
              Delete store
            </Button>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                type="button"
                variant={store.isSuspended ? "default" : "destructive"}
                onClick={onBan}
              >
                {store.isSuspended ? <CircleCheck /> : <Ban />}
                {store.isSuspended ? "Lift ban" : "Ban store"}
              </Button>
            </div>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div className="mt-1.5 space-y-0.5">{children}</div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium tabular-nums">{value}</p>
    </div>
  )
}
