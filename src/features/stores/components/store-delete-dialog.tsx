import { useState } from "react"
import { Trash2 } from "@/lib/icons"

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
import { ApiError } from "@/lib/api/errors"

import { useDeleteAdminStoreMutation } from "../hooks"
import type { AdminStoreSummary } from "../types"

type StoreDeleteDialogProps = {
  store: AdminStoreSummary | null
  open: boolean
  onClose: () => void
  onDeleted?: () => void
}

function StoreDeleteForm({
  store,
  onClose,
  onDeleted,
}: {
  store: AdminStoreSummary
  onClose: () => void
  onDeleted?: () => void
}) {
  const deleteStore = useDeleteAdminStoreMutation()
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    setError(null)

    try {
      await deleteStore.mutateAsync(store.id)
      onDeleted?.()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not delete this store. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !deleteStore.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-destructive/20 bg-destructive/8 px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <StoreAvatar name={store.name} />
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                Delete store
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {store.name}
              </DialogDescription>
              <div className="mt-2.5">
                <UniversalBadge
                  name={store.slug}
                  colors={badgeColors.neutral}
                  showDot={false}
                  className="normal-case"
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
            This permanently removes the storefront record and payout settings.
            The vendor account is not deleted. Deletion is only allowed when the
            store has no products and no order history.
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteStore.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void confirm()}
            disabled={deleteStore.isPending}
          >
            <Trash2 />
            {deleteStore.isPending ? "Deleting…" : "Delete store"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function StoreDeleteDialog({
  store,
  open,
  onClose,
  onDeleted,
}: StoreDeleteDialogProps) {
  if (!open || !store) {
    return null
  }

  return (
    <StoreDeleteForm
      key={store.id}
      store={store}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  )
}
