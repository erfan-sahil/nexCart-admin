import type { ReactNode } from "react"

import {
  CalendarClock,
  History,
  MessageSquare,
  Package,
  Star,
  Store,
  UserRound,
} from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
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
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import type { ManagementReview } from "../types"
import { ReviewStars } from "./review-stars"

type ReviewDetailDialogProps = {
  review: ManagementReview | null
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

function authorInitials(displayName: string) {
  const letters = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
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
  icon: typeof UserRound
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
              nowrap ? "whitespace-nowrap" : "wrap-break-word"
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

export function ReviewDetailDialog({
  review,
  open,
  onClose,
}: ReviewDetailDialogProps) {
  if (!open || !review) {
    return null
  }

  const authorName = review.author.displayName || "Anonymous reviewer"

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
              {authorInitials(authorName)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {authorName}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Buyer review on {review.product.name}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <ReviewStars rating={review.rating} />
                {review.hasVendorReply ? (
                  <UniversalBadge
                    name="Seller replied"
                    colors={badgeColors.approved}
                    showDot={false}
                    className="normal-case"
                  />
                ) : null}
                <UniversalBadge
                  name={`${review.replyCount} ${
                    review.replyCount === 1 ? "reply" : "replies"
                  }`}
                  icon={MessageSquare}
                  colors={badgeColors.neutral}
                  showDot={false}
                  className="normal-case"
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
          <section className="space-y-3">
            <SectionLabel>Review</SectionLabel>
            <DetailItem
              icon={Star}
              label="Rating"
              tone="amber"
              className="sm:max-w-xs"
            >
              <dd className="mt-0.5">
                <ReviewStars rating={review.rating} />
              </dd>
            </DetailItem>
            <div className="rounded-xl border border-border/80 bg-card px-3.5 py-3">
              <p className="text-xs font-medium text-muted-foreground">
                Comment
              </p>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {review.body}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <SectionLabel>Product &amp; store</SectionLabel>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={Package}
                label="Product"
                value={review.product.name}
                tone="brand"
              />
              <DetailItem
                icon={Store}
                label="Store"
                value={review.store.name}
                tone="violet"
              />
              {review.product.slug ? (
                <DetailItem
                  icon={Package}
                  label="Product slug"
                  value={review.product.slug}
                  tone="emerald"
                  className="sm:col-span-2"
                />
              ) : null}
            </dl>
          </section>

          <section className="space-y-3">
            <SectionLabel>Replies</SectionLabel>
            {review.replies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No replies yet.</p>
            ) : (
              <ul className="space-y-2">
                {review.replies.map((reply) => (
                  <li
                    key={reply.id}
                    className="rounded-xl border border-border/80 bg-card px-3.5 py-3"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      {reply.author.displayName}
                    </p>
                    <p className="mt-1 text-sm whitespace-pre-wrap text-foreground">
                      {reply.body}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(reply.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <SectionLabel>Timeline</SectionLabel>
            <dl className="flex flex-wrap gap-3">
              <DetailItem
                icon={CalendarClock}
                label="Posted"
                value={formatDateTime(review.createdAt)}
                tone="brand"
                nowrap
              />
              <DetailItem
                icon={History}
                label="Last updated"
                value={formatDateTime(review.updatedAt)}
                tone="emerald"
                nowrap
              />
            </dl>
          </section>
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
