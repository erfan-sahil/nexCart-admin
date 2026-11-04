import { Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDateTime } from "@/lib/format"

import type { ManagementReview } from "../types"
import { ReviewStars } from "./review-stars"

type ReviewDetailDialogProps = {
  review: ManagementReview | null
  open: boolean
  deleting: boolean
  onClose: () => void
  onDelete: (review: ManagementReview) => void
}

export function ReviewDetailDialog({
  review,
  open,
  deleting,
  onClose,
  onDelete,
}: ReviewDetailDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (!next ? onClose() : undefined)}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review details</DialogTitle>
          <DialogDescription>
            Buyer feedback for {review?.product.name ?? "this product"}.
          </DialogDescription>
        </DialogHeader>

        {review ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <ReviewStars rating={review.rating} />
              <p className="text-sm font-medium">{review.author.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(review.createdAt)} · {review.store.name}
              </p>
            </div>

            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {review.body}
            </p>

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Product
              </p>
              <p className="mt-0.5 text-sm font-medium">
                {review.product.name}
              </p>
              {review.product.slug ? (
                <p className="text-xs text-muted-foreground">
                  {review.product.slug}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Replies ({review.replyCount})
              </p>
              {review.replies.length === 0 ? (
                <p className="text-sm text-muted-foreground">No replies yet.</p>
              ) : (
                <ul className="space-y-2">
                  {review.replies.map((reply) => (
                    <li
                      key={reply.id}
                      className="rounded-lg border border-border px-3 py-2"
                    >
                      <p className="text-xs font-medium">
                        {reply.author.displayName}
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-wrap">
                        {reply.body}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(reply.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            disabled={!review || deleting}
            onClick={() => {
              if (review) {
                onDelete(review)
              }
            }}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete review
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
