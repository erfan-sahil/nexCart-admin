import { useMemo } from "react"
import { flexRender, type PaginationState } from "@tanstack/react-table"
import {
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"

import { UniversalBadge } from "@/components/shared"
import {
  dataTableBodyCell,
  dataTableHeadCell,
} from "@/components/shared/data-table-section"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import {
  formatMoney,
  fulfillmentStatusBadge,
  orderStatusBadge,
  paymentStatusBadge,
} from "../labels"
import type { AdminOrderListItem } from "../types/admin-orders.types"

const PAGE_SIZES = [10, 20, 50] as const

type AdminOrdersTableProps = {
  items: AdminOrderListItem[]
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  emptyLabel: string
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onRetry: () => void
  onOpen: (order: AdminOrderListItem) => void
}

function pageItems(current: number, total: number) {
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

export function AdminOrdersTable({
  items,
  isLoading,
  isFetching,
  errorMessage,
  emptyLabel,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onOpen,
}: AdminOrdersTableProps) {
  const columns = useMemo<LegacyColumnDef<AdminOrderListItem>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {row.original.orderNumber}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDateTime(row.original.createdAt)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Order status",
        cell: ({ row }) => {
          const status = orderStatusBadge(row.original.status)

          return (
            <UniversalBadge
              name={status.name}
              colors={status.colors}
              icon={status.icon}
            />
          )
        },
      },
      {
        accessorKey: "fulfillmentStatus",
        header: "Fulfillment",
        cell: ({ row }) => {
          const status = fulfillmentStatusBadge(row.original.fulfillmentStatus)

          return (
            <UniversalBadge
              name={status.name}
              colors={status.colors}
              icon={status.icon}
            />
          )
        },
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment",
        cell: ({ row }) => {
          const status = paymentStatusBadge(row.original.paymentStatus)

          return (
            <div className="flex flex-col items-start gap-1">
              <UniversalBadge
                name={status.name}
                colors={status.colors}
                icon={status.icon}
              />
              <span className="text-xs text-muted-foreground uppercase">
                {row.original.paymentMethod}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "grandTotal",
        header: () => <span className="block text-right">Total</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <p className="font-medium tabular-nums">
              {formatMoney(row.original.currency, row.original.grandTotal)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {row.original.vendorOrderCount} vendor
              {row.original.vendorOrderCount === 1 ? "" : "s"}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const order = row.original

          return (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={`Open ${order.orderNumber}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onOpen(order)
                }}
              >
                <Eye />
                Open
              </Button>
            </div>
          )
        },
      },
    ],
    [onOpen]
  )

  const paginationState = useMemo<PaginationState>(
    () => ({ pageIndex: Math.max(page - 1, 0), pageSize }),
    [page, pageSize]
  )

  const table = useLegacyTable({
    data: items,
    columns,
    state: { pagination: paginationState },
    pageCount: Math.max(totalPages, 1),
    manualPagination: true,
    autoResetPageIndex: false,
    getRowId: (row) => row.id,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(paginationState) : updater

      if (next.pageSize !== pageSize) {
        onPageSizeChange(next.pageSize)
        onPageChange(1)
        return
      }

      onPageChange(next.pageIndex + 1)
    },
  })

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)
  const pages = pageItems(page, Math.max(totalPages, 1))
  const showPagination = !isLoading && !errorMessage

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className={dataTableHeadCell}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="px-4 py-3">
                  <div className="h-3 w-48 animate-pulse rounded-md bg-muted" />
                </TableCell>
              </TableRow>
            ))
          ) : errorMessage ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="px-5 py-16">
                <div className="flex flex-col items-center text-center">
                  <p className="text-sm font-medium text-destructive">
                    {errorMessage}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={onRetry}
                  >
                    Try again
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="px-5 py-16">
                <div className="mx-auto max-w-md text-center">
                  <p className="text-sm font-medium">No orders found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {emptyLabel}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-brand-soft/50"
                onClick={() => onOpen(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      dataTableBodyCell,
                      cell.column.id === "grandTotal" && "text-right",
                      cell.column.id === "actions" && "w-28"
                    )}
                    onClick={
                      cell.column.id === "actions"
                        ? (event) => event.stopPropagation()
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showPagination ? (
        <div className="flex flex-col gap-3 border-t border-border bg-muted/30 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
                onValueChange={(value) => table.setPageSize(Number(value))}
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
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Pagination
            className={cn("mx-0 w-auto justify-start sm:justify-end")}
          >
            <PaginationContent className="gap-0 rounded-lg border border-border bg-background p-0.5">
              <PaginationItem>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Previous page"
                  disabled={!table.getCanPreviousPage() || isFetching}
                  onClick={() => table.previousPage()}
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
                      onClick={() => table.setPageIndex(item - 1)}
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
                  disabled={!table.getCanNextPage() || isFetching}
                  onClick={() => table.nextPage()}
                >
                  <ChevronRight />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  )
}
