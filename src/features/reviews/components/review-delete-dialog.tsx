import { useState } from "react"
import { Star, Trash2 } from "lucide-react"

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
import { ApiError } from "@/lib/api/errors"

import { useDeleteAdminReviewMutation } from "../hooks"
import type { ManagementReview } from "../types"

type ReviewDeleteDialogProps = {
  review: ManagementReview | null
  open: boolean
  onClose: () => void
  onDeleted?: (reviewId: string) => void
}

function authorInitials(displayName: string) {
  const letters = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

function ReviewDeleteForm({
  review,
  onClose,
  onDeleted,
}: {
  review: ManagementReview
  onClose: () => void
  onDeleted?: (reviewId: string) => void
}) {
  const deleteReview = useDeleteAdminReviewMutation()
  const [error, setError] = useState<string | null>(null)
  const authorName = review.author.displayName || "Anonymous reviewer"

  const confirm = async () => {
    setError(null)

    try {
      await deleteReview.mutateAsync(review.id)
      onDeleted?.(review.id)
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not delete this review. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !deleteReview.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-destructive/20 bg-destructive/8 px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive text-base font-semibold text-white shadow-sm ring-4 ring-background">
              {authorInitials(authorName)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {authorName}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Delete buyer review
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={`${review.rating} stars`}
                  icon={Star}
                  colors={badgeColors.approved}
                  showDot={false}
                />
                <UniversalBadge
                  name={review.product.name}
                  colors={badgeColors.neutral}
                  showDot={false}
                  className="max-w-48 normal-case"
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
            Permanently delete this review on{" "}
            <span className="font-medium wrap-break-word text-foreground">
              {review.product.name}
            </span>
            . This cannot be undone.
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
            disabled={deleteReview.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            onClick={() => void confirm()}
            disabled={deleteReview.isPending}
          >
            <Trash2 />
            {deleteReview.isPending ? "Deleting…" : "Delete review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ReviewDeleteDialog({
  review,
  open,
  onClose,
  onDeleted,
}: ReviewDeleteDialogProps) {
  if (!open || !review) {
    return null
  }

  return (
    <ReviewDeleteForm
      key={review.id}
      review={review}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  )
}
