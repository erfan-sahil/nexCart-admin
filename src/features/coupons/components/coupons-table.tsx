import {
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
} from "@/lib/icons"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { formatCouponDate } from "../datetime"
import {
  COUPON_LIFECYCLE_BADGE,
  COUPON_LIFECYCLE_LABEL,
  formatCouponDiscount,
  formatUsageLimit,
  getCouponLifecycle,
} from "../labels"
import type { Coupon } from "../types"

type CouponsTableProps = {
  items: Coupon[]
  isLoading: boolean
  isToggling: boolean
  emptyMessage: string
  onView: (coupon: Coupon) => void
  onEdit: (coupon: Coupon) => void
  onToggleEnabled: (coupon: Coupon, isEnabled: boolean) => void
}

export function CouponsTable({
  items,
  isLoading,
  isToggling,
  emptyMessage,
  onView,
  onEdit,
  onToggleEnabled,
}: CouponsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading coupons…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Window</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-14 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((coupon) => {
            const lifecycle = getCouponLifecycle(coupon)

            return (
              <TableRow
                key={coupon.id}
                className="cursor-pointer"
                onClick={() => onView(coupon)}
              >
                <TableCell className="max-w-48 px-3 py-1.5 align-middle">
                  <p className="truncate font-mono text-sm font-medium">
                    {coupon.code}
                  </p>
                  {coupon.label ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {coupon.label}
                    </p>
                  ) : null}
                </TableCell>

                <TableCell className="px-3 py-1.5 align-middle text-sm whitespace-nowrap">
                  {formatCouponDiscount(
                    coupon.discountType,
                    coupon.discountValue
                  )}
                  {coupon.minimumSubtotal > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Min {coupon.minimumSubtotal}
                    </p>
                  ) : null}
                </TableCell>

                <TableCell className="px-3 py-1.5 align-middle whitespace-nowrap">
                  <div className="text-xs leading-snug">
                    <p>{formatCouponDate(coupon.startsAt)}</p>
                    <p className="text-muted-foreground">
                      → {formatCouponDate(coupon.endsAt)}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="px-3 py-1.5 align-middle text-xs whitespace-nowrap text-muted-foreground">
                  {formatUsageLimit(coupon.usageLimit, coupon.usedCount)}
                </TableCell>

                <TableCell className="px-3 py-1.5 align-middle">
                  <div className="flex flex-col gap-1">
                    <UniversalBadge
                      name={COUPON_LIFECYCLE_LABEL[lifecycle]}
                      colors={COUPON_LIFECYCLE_BADGE[lifecycle]}
                    />
                    {!coupon.isEnabled ? (
                      <span className="text-xs text-muted-foreground">
                        Disabled
                      </span>
                    ) : null}
                  </div>
                </TableCell>

                <TableCell
                  className="px-3 py-1.5 text-right align-middle"
                  onClick={(event) => event.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="cursor-pointer"
                        aria-label={`Actions for ${coupon.code}`}
                        disabled={isToggling}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-44">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() => {
                          window.setTimeout(() => onView(coupon), 0)
                        }}
                      >
                        <Eye className="size-3.5" />
                        Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() => {
                          window.setTimeout(() => onEdit(coupon), 0)
                        }}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        disabled={isToggling}
                        onSelect={() =>
                          onToggleEnabled(coupon, !coupon.isEnabled)
                        }
                      >
                        {coupon.isEnabled ? (
                          <>
                            <PowerOff className="size-4" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Power className="size-4" />
                            Enable
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
