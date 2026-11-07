import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router"

import {
  AdminPageIntro,
  badgeColors,
  UniversalBadge,
} from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import {
  PAYOUT_METHOD_LABEL,
  WITHDRAWAL_STATUS_COLORS,
  WITHDRAWAL_STATUS_LABEL,
} from "../constants"
import { formatListRange } from "../lib/format"

const TABLE_PAGE_SIZES = [10, 20, 50] as const

function paginationPageItems(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  const items: Array<number | "ellipsis"> = [1]

  if (start > 2) {
    items.push("ellipsis")
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (end < total - 1) {
    items.push("ellipsis")
  }

  items.push(total)
  return items
}

type FinanceLayoutProps = {
  children: ReactNode
}

export function FinanceLayout({ children }: FinanceLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-2">
      {children}
    </div>
  )
}

type FinancePageIntroProps = {
  title: string
  description: string
  aside?: ReactNode
}

export function FinancePageIntro({
  title,
  description,
  aside,
}: FinancePageIntroProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <AdminPageIntro title={title} description={description} />
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  )
}

type StatTone = "brand" | "success" | "warning" | "info" | "neutral"

const STAT_TONE: Record<StatTone, string> = {
  brand: "bg-brand-soft text-brand-text",
  success:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning:
    "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  info: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  neutral: "bg-secondary text-secondary-foreground",
}

type FinanceStatCardProps = {
  icon: LucideIcon
  tone?: StatTone
  label: string
  value: string
  detail?: string
  className?: string
}

export function FinanceStatCard({
  icon: Icon,
  tone = "brand",
  label,
  value,
  detail,
  className,
}: FinanceStatCardProps) {
  return (
    <article
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm",
        className
      )}
    >
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="mt-2 block text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {detail ? (
          <span className="mt-1 block text-xs text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          STAT_TONE[tone]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
    </article>
  )
}

export function FinanceStatGrid({ children }: { children: ReactNode }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </section>
  )
}

type FinanceSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  noPadding?: boolean
}

export function FinanceSection({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  noPadding,
}: FinanceSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn(!noPadding && "p-0", bodyClassName)}>{children}</div>
    </section>
  )
}

export function FinanceStatSkeleton() {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-[7.25rem] animate-pulse rounded-xl border border-border bg-muted/60"
        />
      ))}
    </div>
  )
}

export function FinanceTableSkeleton() {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4 sm:px-5">
          <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-40 max-w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          </div>
          <div className="hidden h-3 w-20 animate-pulse rounded bg-muted md:block" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function FinanceInlineNav({
  items,
}: {
  items: { label: string; to: string }[]
}) {
  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="inline-flex items-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function WithdrawalStatusBadge({ status }: { status: string }) {
  const colors = WITHDRAWAL_STATUS_COLORS[status] ?? badgeColors.neutral
  const label = WITHDRAWAL_STATUS_LABEL[status] ?? status.replace(/_/g, " ")

  return <UniversalBadge name={label} colors={colors} />
}

export function PayoutMethodBadge({ method }: { method: string }) {
  const label = PAYOUT_METHOD_LABEL[method] ?? method

  return (
    <UniversalBadge
      name={label}
      colors={badgeColors.neutral}
      showDot={false}
      className="capitalize"
    />
  )
}

export function FinanceTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isFetching,
}: {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isFetching?: boolean
}) {
  const safeTotalPages = Math.max(totalPages, 1)
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)
  const pages = paginationPageItems(page, safeTotalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-muted/40 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <p className="tabular-nums">
          <span className="font-medium text-foreground">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of {total}
        </p>
        <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
        <div className="flex items-center gap-2">
          <span className="text-xs">Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              onPageSizeChange(Number(value))
              onPageChange(1)
            }}
            disabled={isFetching}
          >
            <SelectTrigger
              size="sm"
              className="bg-background"
              aria-label="Rows per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {TABLE_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Pagination className={cn("mx-0 w-auto justify-start sm:justify-end")}>
        <PaginationContent className="gap-0 rounded-lg border border-border bg-background p-0.5">
          <PaginationItem>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous page"
              disabled={page <= 1 || isFetching}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft />
            </Button>
          </PaginationItem>
          {pages.map((item, index) => (
            <PaginationItem
              key={item === "ellipsis" ? `ellipsis-${index}` : item}
            >
              {item === "ellipsis" ? (
                <PaginationEllipsis className="size-7" />
              ) : (
                <Button
                  type="button"
                  variant={item === page ? "default" : "ghost"}
                  size="icon-sm"
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  disabled={isFetching}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next page"
              disabled={page >= safeTotalPages || isFetching}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

/** @deprecated Use FinanceTablePagination */
export function FinancePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  disabled,
  noun = "records",
}: {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  disabled?: boolean
  noun?: string
}) {
  const range = formatListRange(page, limit, total).replace("records", noun)

  if (totalPages <= 1) {
    return <p className="text-xs text-muted-foreground">{range}</p>
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <p className="text-xs text-muted-foreground">{range}</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

export function StoreAvatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-text"
      aria-hidden="true"
    >
      {initials || "?"}
    </span>
  )
}

export function BalanceMixBar({
  pending,
  available,
  withdrawn = 0,
}: {
  pending: number
  available: number
  withdrawn?: number
}) {
  const total = pending + available + withdrawn

  if (total <= 0) {
    return (
      <div className="h-1.5 w-full max-w-[8rem] overflow-hidden rounded-full bg-muted" />
    )
  }

  const pendingShare = (pending / total) * 100
  const availableShare = (available / total) * 100
  const withdrawnShare = (withdrawn / total) * 100

  return (
    <div
      className="flex h-1.5 w-full max-w-[8rem] overflow-hidden rounded-full bg-muted"
      title={`${Math.round(pendingShare)}% pending · ${Math.round(availableShare)}% available · ${Math.round(withdrawnShare)}% withdrawn`}
    >
      {pendingShare > 0 ? (
        <div
          className="h-full bg-amber-500/80"
          style={{ width: `${pendingShare}%` }}
        />
      ) : null}
      {availableShare > 0 ? (
        <div
          className="h-full bg-emerald-500/80"
          style={{ width: `${availableShare}%` }}
        />
      ) : null}
      {withdrawnShare > 0 ? (
        <div
          className="h-full bg-sky-500/70"
          style={{ width: `${withdrawnShare}%` }}
        />
      ) : null}
    </div>
  )
}
