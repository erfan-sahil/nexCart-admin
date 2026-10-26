import { useState } from "react"
import { Loader2, Store } from "lucide-react"

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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/features/auth/store"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import {
  useCategoryNamesQuery,
  useReviewVendorApplicationMutation,
  useVendorApplicationQuery,
  type ReviewAction,
} from "../hooks"
import { BUSINESS_TYPE_LABEL, STATUS_LABEL } from "../labels"
import type { VendorApplication } from "../types"
import { VendorApplicationDetails } from "./vendor-application-details"

type VendorApplicationDialogMode = "details" | "review"

type VendorApplicationDialogProps = {
  applicationId: string | null
  mode: VendorApplicationDialogMode
  open: boolean
  onClose: () => void
}

function initials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

function actionError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return "Could not update this application. Please try again."
}

function ReviewPanel({
  application,
  categoryNames,
  mode,
  onClose,
}: {
  application: VendorApplication
  categoryNames: Map<string, string> | undefined
  mode: VendorApplicationDialogMode
  onClose: () => void
}) {
  const review = useReviewVendorApplicationMutation()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const [note, setNote] = useState("")
  const [noteError, setNoteError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<"approve" | "reject" | null>(null)
  const isOwn = Boolean(currentUserId) && currentUserId === application.userId
  const reviewing = mode === "review" && application.status !== "draft"
  const canAct =
    reviewing &&
    !isOwn &&
    (application.status === "submitted" ||
      application.status === "under_review")
  const prioritizeReview =
    canAct && application.status === "under_review" && confirm === null
  const name = application.personal.fullName || "Unnamed applicant"
  const businessType = application.business.businessType
    ? BUSINESS_TYPE_LABEL[application.business.businessType]
    : "Business type not set"

  const requireNote = () => {
    if (note.trim().length < 5) {
      setNoteError("Add a note of at least 5 characters.")
      return false
    }

    setNoteError(null)
    return true
  }

  const run = async (action: ReviewAction) => {
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
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-sm ring-4 ring-background">
              {initials(name)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {application.business.storeName || "Store name not set"} ·{" "}
                {businessType}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={STATUS_LABEL[application.status]}
                  colors={badgeColors[application.status]}
                  className="normal-case"
                />
                <UniversalBadge
                  name="Vendor application"
                  icon={Store}
                  colors={badgeColors.buyer}
                  showDot={false}
                  className="normal-case"
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea
          type="auto"
          className={cn(
            "bg-muted/20",
            prioritizeReview
              ? "max-h-[min(36vh,calc(100dvh-30rem))]"
              : "max-h-[calc(100dvh-24rem)]"
          )}
          viewportClassName={
            prioritizeReview
              ? "max-h-[min(36vh,calc(100dvh-30rem))]"
              : "max-h-[calc(100dvh-24rem)]"
          }
        >
          <div className="space-y-5 px-6 py-5">
            <p className="text-xs text-muted-foreground">
              Submitted {formatDateTime(application.submittedAt)}
              {application.reviewedAt
                ? ` · Last reviewed ${formatDateTime(application.reviewedAt)}`
                : ""}
            </p>
            <VendorApplicationDetails
              application={application}
              categoryNames={categoryNames}
            />
          </div>
        </ScrollArea>

        <DialogFooter
          className={cn(
            "shrink-0 flex-col items-stretch gap-3 border-t border-border bg-card px-6 py-4 sm:flex-col sm:items-stretch",
            prioritizeReview && "gap-4 py-5"
          )}
        >
          {reviewing && isOwn ? (
            <p className="text-sm text-muted-foreground">
              You cannot review your own application.
            </p>
          ) : null}
          {canAct && confirm === null ? (
            <Field data-invalid={Boolean(noteError) || undefined}>
              <FieldLabel htmlFor="application-note">Review note</FieldLabel>
              <Textarea
                id="application-note"
                value={note}
                maxLength={1000}
                placeholder="Required when you request more information or reject."
                aria-invalid={Boolean(noteError) || undefined}
                disabled={review.isPending}
                className={prioritizeReview ? "min-h-32" : undefined}
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
              Approving creates the store and gives this account vendor access.
            </p>
          ) : null}
          {confirm === "reject" ? (
            <p className="text-sm text-foreground">
              The applicant can edit this application and submit it again.
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
            {confirm === "approve" ? (
              <Button
                type="button"
                className="cursor-pointer"
                disabled={review.isPending}
                onClick={() =>
                  void run({
                    type: "approve",
                    id: application.id,
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
                    id: application.id,
                    note,
                  })
                }
              >
                {review.isPending ? <Loader2 className="animate-spin" /> : null}
                Confirm rejection
              </Button>
            ) : null}
            {canAct &&
            confirm === null &&
            application.status === "submitted" ? (
              <Button
                type="button"
                className="cursor-pointer"
                disabled={review.isPending}
                onClick={() =>
                  void run({
                    type: "start-review",
                    id: application.id,
                    note,
                  })
                }
              >
                {review.isPending ? <Loader2 className="animate-spin" /> : null}
                Start review
              </Button>
            ) : null}
            {canAct &&
            confirm === null &&
            application.status === "under_review" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-10 cursor-pointer px-4"
                  disabled={review.isPending}
                  onClick={() => {
                    if (requireNote()) {
                      void run({
                        type: "request-info",
                        id: application.id,
                        note,
                      })
                    }
                  }}
                >
                  {review.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : null}
                  Request info
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  className="h-10 cursor-pointer px-4"
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
                  className="h-10 cursor-pointer px-4"
                  size="lg"
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

export function VendorApplicationDialog({
  applicationId,
  mode,
  open,
  onClose,
}: VendorApplicationDialogProps) {
  const application = useVendorApplicationQuery(open ? applicationId : null)
  const categories = useCategoryNamesQuery(open)

  if (!open || !applicationId) {
    return null
  }

  if (application.data) {
    return (
      <ReviewPanel
        application={application.data}
        categoryNames={categories.data}
        mode={mode}
        onClose={onClose}
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
          <DialogTitle>Vendor application</DialogTitle>
          <DialogDescription>
            {application.isError
              ? application.error instanceof ApiError
                ? application.error.message
                : "Could not load this application."
              : "Loading the application."}
          </DialogDescription>
        </DialogHeader>
        {application.isError ? (
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => void application.refetch()}
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
