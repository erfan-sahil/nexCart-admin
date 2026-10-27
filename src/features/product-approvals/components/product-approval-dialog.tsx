import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import {
  useProductQuery,
  useReviewProductMutation,
  type ProductReviewAction,
} from "../hooks"
import type { Product } from "../types"
import { ProductApprovalDetails } from "./product-approval-details"

type ProductApprovalDialogMode = "details" | "review"

type ProductApprovalDialogProps = {
  productId: string | null
  mode: ProductApprovalDialogMode
  open: boolean
  onClose: () => void
  onReview: () => void
}

function actionError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return "Could not update this product. Please try again."
}

function ReviewPanel({
  product,
  mode,
  onClose,
  onReview,
}: {
  product: Product
  mode: ProductApprovalDialogMode
  onClose: () => void
  onReview: () => void
}) {
  const review = useReviewProductMutation()
  const [note, setNote] = useState("")
  const [noteError, setNoteError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<"approve" | "reject" | null>(null)
  const canAct = mode === "review" && product.approvalStatus === "submitted"
  const prioritizeReview = canAct && confirm === null

  const requireNote = () => {
    if (note.trim().length < 5) {
      setNoteError("Add a note of at least 5 characters.")
      return false
    }

    setNoteError(null)
    return true
  }

  const run = async (action: ProductReviewAction) => {
    setError(null)

    try {
      await review.mutateAsync(action)
      setNote("")
      setNoteError(null)
      setConfirm(null)
    } catch (err) {
      setError(actionError(err))
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !review.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-5 text-left">
          <DialogTitle className="pr-8 text-lg font-semibold">
            {product.name}
          </DialogTitle>
          <DialogDescription className="mt-1 text-foreground/70">
            {product.store.name || "Unknown store"}
            {product.shortDescription ? ` · ${product.shortDescription}` : ""}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea
          type="auto"
          className={cn(
            "bg-muted/20",
            prioritizeReview
              ? "max-h-[min(42vh,calc(100dvh-28rem))]"
              : "max-h-[calc(100dvh-18rem)]"
          )}
          viewportClassName={
            prioritizeReview
              ? "max-h-[min(42vh,calc(100dvh-28rem))]"
              : "max-h-[calc(100dvh-18rem)]"
          }
        >
          <div className="px-6 py-5">
            <ProductApprovalDetails product={product} />
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 flex-col items-stretch gap-3 border-t border-border bg-card px-6 py-4 sm:flex-col sm:items-stretch">
          {canAct && confirm === null ? (
            <Field data-invalid={Boolean(noteError) || undefined}>
              <FieldLabel htmlFor="product-review-note">Review note</FieldLabel>
              <Textarea
                id="product-review-note"
                value={note}
                maxLength={1000}
                placeholder="Optional when approving. Required when rejecting."
                aria-invalid={Boolean(noteError) || undefined}
                disabled={review.isPending}
                onChange={(event) => {
                  setNote(event.target.value)
                  setNoteError(null)
                }}
              />
              {noteError ? <FieldError>{noteError}</FieldError> : null}
            </Field>
          ) : null}
          {confirm === "approve" ? (
            <p className="text-sm text-foreground">
              Approving publishes this product on the store.
            </p>
          ) : null}
          {confirm === "reject" ? (
            <p className="text-sm text-foreground">
              The vendor can edit this product and submit it again.
            </p>
          ) : null}
          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={review.isPending}
              onClick={() => {
                if (confirm) {
                  setConfirm(null)
                  return
                }

                onClose()
              }}
            >
              {confirm ? "Back" : "Close"}
            </Button>
            {mode === "details" && product.approvalStatus === "submitted" ? (
              <Button
                type="button"
                className="cursor-pointer"
                onClick={onReview}
              >
                Review
              </Button>
            ) : null}
            {confirm === "approve" ? (
              <Button
                type="button"
                className="cursor-pointer"
                disabled={review.isPending}
                onClick={() =>
                  void run({
                    type: "approve",
                    id: product.id,
                    note,
                  })
                }
              >
                {review.isPending ? <Loader2 className="animate-spin" /> : null}
                Confirm approval
              </Button>
            ) : null}
            {confirm === "reject" ? (
              <Button
                type="button"
                variant="destructive"
                className="cursor-pointer"
                disabled={review.isPending}
                onClick={() =>
                  void run({
                    type: "reject",
                    id: product.id,
                    note,
                  })
                }
              >
                {review.isPending ? <Loader2 className="animate-spin" /> : null}
                Confirm rejection
              </Button>
            ) : null}
            {canAct && confirm === null ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  className="cursor-pointer"
                  disabled={review.isPending}
                  onClick={() => {
                    if (requireNote()) {
                      setError(null)
                      setConfirm("reject")
                    }
                  }}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  className="cursor-pointer"
                  disabled={review.isPending}
                  onClick={() => {
                    setNoteError(null)
                    setError(null)
                    setConfirm("approve")
                  }}
                >
                  Approve
                </Button>
              </>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProductApprovalDialog({
  productId,
  mode,
  open,
  onClose,
  onReview,
}: ProductApprovalDialogProps) {
  const product = useProductQuery(open ? productId : null)

  if (!open || !productId) {
    return null
  }

  if (product.data) {
    return (
      <ReviewPanel
        key={`${product.data.id}-${mode}`}
        product={product.data}
        mode={mode}
        onClose={onClose}
        onReview={onReview}
      />
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Product</DialogTitle>
          <DialogDescription>
            {product.isError
              ? product.error instanceof ApiError
                ? product.error.message
                : "Could not load this product."
              : "Loading the product."}
          </DialogDescription>
        </DialogHeader>
        {product.isError ? (
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => void product.refetch()}
          >
            Try again
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
