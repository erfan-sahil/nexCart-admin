import { useState } from "react"
import {
  ArrowRight,
  BadgePercent,
  CircleDollarSign,
  ShoppingCart,
  UserPlus,
} from "@/lib/icons"
import { Link } from "react-router"

import {
  AdminPageIntro,
  badgeColors,
  UniversalBadge,
} from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FinanceStatCard,
  FinanceStatGrid,
  FinanceStatSkeleton,
} from "@/features/finance/components/finance-ui"
import { formatBdt } from "@/features/finance/lib/format"
import { orderStatusBadge, paymentStatusBadge } from "@/features/orders/labels"
import { STATUS_LABEL } from "@/features/vendor-applications/labels"
import type { VendorApplicationStatus } from "@/features/vendor-applications/types"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useDashboardOverviewQuery } from "../hooks"
import {
  dashboardRangeLabel,
  formatChangeDetail,
  formatChartDayLabel,
  formatCount,
} from "../lib/format"
import { DASHBOARD_RANGES, type DashboardRange } from "../types"

export function DashboardHome() {
  const [range, setRange] = useState<DashboardRange>("7d")
  const overviewQuery = useDashboardOverviewQuery(range)

  const errorMessage =
    overviewQuery.error instanceof ApiError
      ? overviewQuery.error.message
      : overviewQuery.isError
        ? "Could not load dashboard."
        : null

  const data = overviewQuery.data
  const salesSeries = data?.salesSeries ?? []
  const salesMax =
    salesSeries.length === 0
      ? 0
      : Math.max(...salesSeries.map((point) => point.gmv), 0)

  const rangeLabel = dashboardRangeLabel(range)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageIntro />
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Marketplace snapshot for{" "}
          <span className="font-medium text-foreground">{rangeLabel}</span>
          {data?.generatedAt ? (
            <> · Updated {formatDateTime(data.generatedAt)}</>
          ) : null}
        </p>
        <Select
          value={range}
          onValueChange={(value) => setRange(value as DashboardRange)}
        >
          <SelectTrigger className="h-9 w-full sm:w-40" aria-label="Time range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DASHBOARD_RANGES.map((option) => (
              <SelectItem key={option} value={option}>
                {dashboardRangeLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {overviewQuery.isLoading ? (
        <FinanceStatSkeleton />
      ) : errorMessage ? (
        <section className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => overviewQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : data ? (
        <>
          <FinanceStatGrid>
            <FinanceStatCard
              icon={CircleDollarSign}
              tone="brand"
              label="Gross sales"
              value={formatBdt(data.period.gmv.current)}
              detail={formatChangeDetail(data.period.gmv.changePercent)}
            />
            <FinanceStatCard
              icon={BadgePercent}
              tone="success"
              label="Commission"
              value={formatBdt(data.period.commission.current)}
              detail={formatChangeDetail(data.period.commission.changePercent)}
            />
            <FinanceStatCard
              icon={ShoppingCart}
              tone="info"
              label="Orders"
              value={formatCount(data.period.orders.current)}
              detail={formatChangeDetail(data.period.orders.changePercent)}
            />
            <FinanceStatCard
              icon={UserPlus}
              tone="warning"
              label="New customers"
              value={formatCount(data.period.newCustomers.current)}
              detail={formatChangeDetail(
                data.period.newCustomers.changePercent
              )}
            />
          </FinanceStatGrid>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {(
              [
                ["Customers", data.marketplace.customers],
                ["Vendors", data.marketplace.vendors],
                ["Active stores", data.marketplace.activeStores],
                ["Suspended stores", data.marketplace.suspendedStores],
                ["Published products", data.marketplace.publishedProducts],
              ] as const
            ).map(([label, value]) => (
              <article
                key={label}
                className="rounded-xl border border-border bg-card px-4 py-3 text-card-foreground shadow-sm"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums">
                  {formatCount(value)}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-5">
            <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5 xl:col-span-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Sales trend</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Daily GMV from vendor orders ({rangeLabel.toLowerCase()}).
                  </p>
                </div>
                <p className="text-sm font-medium text-brand-text tabular-nums">
                  {formatBdt(data.period.gmv.current)}
                </p>
              </div>
              {data.salesSeries.every((point) => point.gmv === 0) ? (
                <p className="mt-10 text-center text-sm text-muted-foreground">
                  No sales recorded in this period.
                </p>
              ) : (
                <div className="mt-6 flex h-44 items-end gap-1 sm:gap-2">
                  {data.salesSeries.map((point) => {
                    const share =
                      salesMax > 0
                        ? Math.max(4, (point.gmv / salesMax) * 100)
                        : 4

                    return (
                      <div
                        key={point.date}
                        className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
                      >
                        <div className="flex h-36 items-end">
                          <div
                            className="w-full rounded-md"
                            style={{
                              height: `${share}%`,
                              backgroundImage:
                                "linear-gradient(to top, var(--brand-deep), var(--brand))",
                            }}
                            title={`${point.date}: ${formatBdt(point.gmv)}`}
                          />
                        </div>
                        <span className="truncate text-center text-[10px] text-muted-foreground sm:text-[11px]">
                          {formatChartDayLabel(point.date, range)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </article>

            <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5 xl:col-span-2">
              <h2 className="text-sm font-semibold">Needs attention</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Open queues across moderation, commerce, and finance.
              </p>
              <ul className="mt-4 divide-y divide-border">
                {data.attentionQueues.map((queue) => (
                  <li key={queue.key}>
                    <Link
                      to={queue.adminPath}
                      className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-brand-text"
                    >
                      <span className="min-w-0 truncate font-medium">
                        {queue.label}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 tabular-nums">
                        <span
                          className={cn(
                            "font-semibold",
                            queue.count > 0
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatCount(queue.count)}
                        </span>
                        <ArrowRight
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="border-b border-border px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold">
                Recent vendor applications
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Latest stores waiting for review.
              </p>
            </div>
            {data.recentVendorApplications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">
                No applications in the review queue.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentVendorApplications.map((application) => (
                  <li
                    key={application.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {application.storeName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {application.submittedAt
                          ? formatDateTime(application.submittedAt)
                          : "Not submitted"}
                      </p>
                    </div>
                    <UniversalBadge
                      name={
                        STATUS_LABEL[
                          application.status as VendorApplicationStatus
                        ] ?? application.status
                      }
                      colors={
                        badgeColors[
                          application.status as VendorApplicationStatus
                        ] ?? badgeColors.neutral
                      }
                      className="normal-case"
                    />
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-border px-4 py-3 sm:px-5">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/users/vendor-applications">
                  View all applications
                </Link>
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="border-b border-border px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold">Recent orders</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Latest customer orders on the platform.
              </p>
            </div>
            {data.recentOrders.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">
                No orders yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Placed</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentOrders.map((order) => {
                      const status = orderStatusBadge(order.status)
                      const payment = paymentStatusBadge(order.paymentStatus)

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            <Link
                              to={`/commerce/orders/${order.id}`}
                              className="text-brand-text hover:underline"
                            >
                              {order.orderNumber}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {formatBdt(order.grandTotal)}
                          </TableCell>
                          <TableCell>
                            <UniversalBadge
                              name={payment.name}
                              colors={payment.colors}
                              icon={payment.icon}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <UniversalBadge
                              name={status.name}
                              colors={status.colors}
                              icon={status.icon}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="border-t border-border px-4 py-3 sm:px-5">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/commerce/orders">View all orders</Link>
              </Button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
