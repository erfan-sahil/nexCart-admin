import {
  CalendarClock,
  CalendarRange,
  Hash,
  History,
  Pencil,
  Percent,
  Ticket,
  Users,
  type AppIcon,
} from "@/lib/icons"

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

import { formatCouponDate } from "../datetime"
import {
  COUPON_LIFECYCLE_BADGE,
  COUPON_LIFECYCLE_LABEL,
  formatCouponDiscount,
  formatUsageLimit,
  getCouponLifecycle,
} from "../labels"
import type { Coupon } from "../types"

type CouponDetailsDialogProps = {
  coupon: Coupon | null
  open: boolean
  onClose: () => void
  onEdit: () => void
}

type DetailTone = "brand" | "emerald" | "amber" | "violet"

const TONE_CLASS: Record<DetailTone, string> = {
  brand: "bg-brand/15 text-brand-text",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

function DetailItem({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: AppIcon
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
        <dd className="mt-0.5 text-sm font-medium wrap-break-word text-foreground">
          {value}
        </dd>
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

export function CouponDetailsDialog({
  coupon,
  open,
  onClose,
  onEdit,
}: CouponDetailsDialogProps) {
  if (!open || !coupon) {
    return null
  }

  const lifecycle = getCouponLifecycle(coupon)
  const usageRemaining =
    coupon.usageLimit === null
      ? "No cap"
      : String(Math.max(coupon.usageLimit - coupon.usedCount, 0))

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <Ticket className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate font-mono text-lg font-semibold">
                {coupon.code}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {coupon.label || "Checkout coupon"}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={COUPON_LIFECYCLE_LABEL[lifecycle]}
                  colors={COUPON_LIFECYCLE_BADGE[lifecycle]}
                />
                <UniversalBadge
                  name={coupon.isEnabled ? "enabled" : "disabled"}
                  colors={
                    coupon.isEnabled ? badgeColors.active : badgeColors.neutral
                  }
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody
          scrollClassName="max-h-[calc(100dvh-16rem)] bg-muted/20"
          viewportClassName="max-h-[calc(100dvh-16rem)]"
        >
          <div className="space-y-5 px-6 py-5">
            <section className="space-y-3">
              <SectionLabel>Discount</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Percent}
                  label="Offer"
                  value={formatCouponDiscount(
                    coupon.discountType,
                    coupon.discountValue
                  )}
                  tone="emerald"
                />
                <DetailItem
                  icon={Hash}
                  label="Type"
                  value={
                    coupon.discountType === "percent"
                      ? "Percentage"
                      : "Fixed amount"
                  }
                  tone="violet"
                />
                <DetailItem
                  icon={Hash}
                  label="Minimum subtotal"
                  value={
                    coupon.minimumSubtotal > 0
                      ? String(coupon.minimumSubtotal)
                      : "No minimum"
                  }
                  tone="amber"
                />
              </dl>
            </section>

            <section className="space-y-3">
              <SectionLabel>Schedule</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={CalendarRange}
                  label="Starts"
                  value={formatCouponDate(coupon.startsAt)}
                  tone="brand"
                />
                <DetailItem
                  icon={CalendarRange}
                  label="Ends"
                  value={formatCouponDate(coupon.endsAt)}
                  tone="brand"
                />
              </dl>
            </section>

            <section className="space-y-3">
              <SectionLabel>Usage</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Users}
                  label="Redemptions"
                  value={formatUsageLimit(coupon.usageLimit, coupon.usedCount)}
                  tone="violet"
                />
                <DetailItem
                  icon={Hash}
                  label="Remaining"
                  value={usageRemaining}
                  tone="emerald"
                />
                <DetailItem
                  icon={Users}
                  label="Per customer"
                  value={
                    coupon.perCustomerLimit > 0
                      ? `${coupon.perCustomerLimit} max`
                      : "Unlimited"
                  }
                  tone="amber"
                />
              </dl>
            </section>

            <section className="space-y-3">
              <SectionLabel>Record</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={CalendarClock}
                  label="Created"
                  value={formatDateTime(coupon.createdAt)}
                  tone="brand"
                />
                <DetailItem
                  icon={History}
                  label="Last updated"
                  value={formatDateTime(coupon.updatedAt)}
                  tone="emerald"
                />
              </dl>
            </section>
          </div>
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
          <Button type="button" className="cursor-pointer" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
