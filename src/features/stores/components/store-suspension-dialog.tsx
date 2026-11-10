import { useState } from "react"
import { Ban, CircleCheck } from "@/lib/icons"

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
import { StoreAvatar } from "@/features/finance/components/finance-ui"
import { ApiError } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import { useSetAdminStoreSuspensionMutation } from "../hooks"
import { STORE_LISTING_STATUS_LABEL, storeListingStatus } from "../labels"
import type { AdminStoreSummary } from "../types"

type StoreSuspensionDialogProps = {
  store: AdminStoreSummary | null
  open: boolean
  onClose: () => void
  onSuccess?: (store: AdminStoreSummary) => void
}

function StoreSuspensionForm({
  store,
  onClose,
  onSuccess,
}: {
  store: AdminStoreSummary
  onClose: () => void
  onSuccess?: (store: AdminStoreSummary) => void
}) {
  const setSuspension = useSetAdminStoreSuspensionMutation()
  const [error, setError] = useState<string | null>(null)
  const banning = !store.isSuspended
  const actionLabel = banning ? "Ban store" : "Lift ban"

  const confirm = async () => {
    setError(null)

    try {
      const updated = await setSuspension.mutateAsync({
        storeId: store.id,
        suspended: banning,
      })
      onSuccess?.({
        id: updated.id,
        userId: updated.userId,
        slug: updated.slug,
        name: updated.name,
        logo: updated.logo,
        rating: updated.rating,
        totalProducts: updated.totalProducts,
        totalOrders: updated.totalOrders,
        totalSales: updated.totalSales,
        joinedAt: updated.joinedAt,
        isActive: updated.isActive,
        isSuspended: updated.isSuspended,
      })
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update this store. Please try again."
      )
    }
  }

  const status = storeListingStatus(store)

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !setSuspension.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader
          className={cn(
            "shrink-0 border-b px-6 py-6 text-left",
            banning
              ? "border-destructive/20 bg-destructive/8"
              : "border-brand/20 bg-brand-soft"
          )}
        >
          <div className="flex items-center gap-4 pr-8">
            <StoreAvatar name={store.name} />
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {store.name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {banning
                  ? "Ban from marketplace"
                  : "Restore marketplace access"}
              </DialogDescription>
              <div className="mt-2.5">
                <UniversalBadge
                  name={STORE_LISTING_STATUS_LABEL[status]}
                  colors={
                    status === "listed"
                      ? badgeColors.active
                      : status === "suspended"
                        ? badgeColors.suspended
                        : badgeColors.neutral
                  }
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          {error ? (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <p className="text-sm text-muted-foreground">
            {banning ? (
              <>
                Banning{" "}
                <span className="font-medium text-foreground">
                  {store.name}
                </span>{" "}
                hides the storefront and its products from shoppers. The vendor
                account can still sign in.
              </>
            ) : (
              <>
                Lifting the ban on{" "}
                <span className="font-medium text-foreground">
                  {store.name}
                </span>{" "}
                allows the store to appear on the marketplace again when it is
                also marked active.
              </>
            )}
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={setSuspension.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={banning ? "destructive" : "default"}
            onClick={() => void confirm()}
            disabled={setSuspension.isPending}
          >
            {banning ? <Ban /> : <CircleCheck />}
            {setSuspension.isPending
              ? banning
                ? "Banning…"
                : "Lifting ban…"
              : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function StoreSuspensionDialog({
  store,
  open,
  onClose,
  onSuccess,
}: StoreSuspensionDialogProps) {
  if (!open || !store) {
    return null
  }

  return (
    <StoreSuspensionForm
      key={store.id}
      store={store}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}
