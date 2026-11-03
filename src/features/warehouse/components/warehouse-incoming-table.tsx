import { useMemo } from "react"
import { flexRender, type PaginationState } from "@tanstack/react-table"
import {
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy"
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

import {
  VENDOR_ORDER_STATUS_LABEL,
  vendorOrderStatusBadge,
} from "@/features/orders/labels"
import type { AdminVendorOrderListItem } from "@/features/orders/types/admin-orders.types"

const PAGE_SIZES = [10, 20, 50] as const

type WarehouseIncomingTableProps = {
  items: AdminVendorOrderListItem[]
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onRetry: () => void
  onManage: (row: AdminVendorOrderListItem) => void
}

function pageItems(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  const pages: Array<number | "ellipsis"> = [1]

  if (start > 2) {
    pages.push("ellipsis")
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (end < total - 1) {
    pages.push("ellipsis")
  }

  pages.push(total)
  return pages
}

export function WarehouseIncomingTable({
  items,
  isLoading,
  isFetching,
  errorMessage,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onManage,
}: WarehouseIncomingTableProps) {
  const columns = useMemo<LegacyColumnDef<AdminVendorOrderListItem>[]>(
    () => [
      {
        accessorKey: "vendorOrderNumber",
        header: "Vendor order",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.vendorOrderNumber}</p>
            <p className="text-xs text-muted-foreground">
              Parent {row.original.orderNumber}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "storeName",
        header: "Store",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <UniversalBadge
            name={
              VENDOR_ORDER_STATUS_LABEL[row.original.status] ??
              row.original.status
            }
            colors={vendorOrderStatusBadge(row.original.status)}
          />
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDateTime(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    window.setTimeout(() => onManage(row.original), 0)
                  }}
                >
                  <ExternalLink />
                  Open parent order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [onManage]
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

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-10 px-3 first:pl-4 last:pr-4"
                >
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
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center">
                Loading…
              </TableCell>
            </TableRow>
          ) : errorMessage ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center">
                <p className="text-destructive">{errorMessage}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={onRetry}
                >
                  Try again
                </Button>
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-muted-foreground"
              >
                No vendor orders in this queue.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-brand-soft/60"
                onClick={() => onManage(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-3 py-2.5"
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

      {!isLoading && !errorMessage ? (
        <div className="flex flex-col gap-3 border-t bg-muted/40 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground tabular-nums">
            {rangeStart}–{rangeEnd} of {total}
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent className="gap-0 rounded-lg border bg-background p-0.5">
              <PaginationItem>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={!table.getCanPreviousPage() || isFetching}
                  onClick={() => table.previousPage()}
                >
                  <ChevronLeft />
                </Button>
              </PaginationItem>
              {pages.map((item, index) => (
                <PaginationItem key={item === "ellipsis" ? `e-${index}` : item}>
                  {item === "ellipsis" ? (
                    <PaginationEllipsis className="size-7" />
                  ) : (
                    <Button
                      type="button"
                      variant={item === page ? "default" : "ghost"}
                      size="icon-sm"
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
                  disabled={!table.getCanNextPage() || isFetching}
                  onClick={() => table.nextPage()}
                >
                  <ChevronRight />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
            disabled={isFetching}
          >
            <SelectTrigger size="sm" className="w-20 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  )
}
