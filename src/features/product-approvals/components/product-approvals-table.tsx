import { useMemo } from "react"
import { flexRender, type PaginationState } from "@tanstack/react-table"
import {
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy"
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Eye,
  MoreHorizontal,
  Package,
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
import { resolveAssetUrl } from "@/lib/api/assets"
import { formatDateTime } from "@/lib/format"

import { APPROVAL_BADGE, STATUS_BADGE } from "../badges"
import {
  formatOriginalPriceRange,
  formatPriceRange,
  formatVariantCount,
} from "../lib/format"
import { PRODUCT_APPROVAL_LABEL, PRODUCT_STATUS_LABEL } from "../labels"
import type { Product } from "../types"

const PAGE_SIZES = [10, 20, 50] as const

type ProductApprovalsTableProps = {
  items: Product[]
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
  onOpen: (product: Product) => void
  onReview: (product: Product) => void
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

function ProductThumb({ product }: { product: Product }) {
  if (!product.thumbnail) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Package className="size-4" />
      </span>
    )
  }

  return (
    <img
      src={resolveAssetUrl(product.thumbnail.url)}
      alt=""
      className="size-10 shrink-0 rounded-lg bg-muted object-cover"
    />
  )
}

export function ProductApprovalsTable({
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
  onReview,
}: ProductApprovalsTableProps) {
  const columns = useMemo<LegacyColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => {
          const product = row.original

          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <ProductThumb product={product} />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {product.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {product.slug}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        id: "store",
        header: "Store",
        cell: ({ row }) => {
          const product = row.original

          return (
            <div className="min-w-0">
              <p className="truncate text-foreground">
                {product.store.name || "—"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {product.category.name || "Uncategorized"}
              </p>
            </div>
          )
        },
      },
      {
        id: "price",
        header: "Price",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-foreground">
              {formatPriceRange(row.original.offer)}
            </p>
            {formatOriginalPriceRange(row.original.offer) ? (
              <p className="truncate text-xs text-muted-foreground line-through">
                {formatOriginalPriceRange(row.original.offer)}
              </p>
            ) : null}
            <p className="truncate text-xs text-muted-foreground">
              {formatVariantCount(row.original.offer.variantCount)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Listing",
        cell: ({ row }) => (
          <UniversalBadge
            name={PRODUCT_STATUS_LABEL[row.original.status]}
            colors={STATUS_BADGE[row.original.status]}
            className="normal-case"
          />
        ),
      },
      {
        accessorKey: "approvalStatus",
        header: "Approval",
        cell: ({ row }) => (
          <span title={row.original.reviewNote || undefined}>
            <UniversalBadge
              name={PRODUCT_APPROVAL_LABEL[row.original.approvalStatus]}
              colors={APPROVAL_BADGE[row.original.approvalStatus]}
              className="normal-case"
            />
          </span>
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
        cell: ({ row }) => {
          const product = row.original

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer"
                    aria-label={`Actions for ${product.name}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onSelect={() => {
                      window.setTimeout(() => onOpen(product), 0)
                    }}
                  >
                    <Eye />
                    Details
                  </DropdownMenuItem>
                  {product.approvalStatus === "submitted" ? (
                    <DropdownMenuItem
                      onSelect={() => {
                        window.setTimeout(() => onReview(product), 0)
                      }}
                    >
                      <ClipboardCheck />
                      Review
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [onOpen, onReview]
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
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-10 px-3 text-xs font-medium text-muted-foreground first:pl-4 last:pr-4"
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
            Array.from({ length: 6 }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 animate-pulse rounded-lg bg-muted" />
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="h-3 w-40 animate-pulse rounded-md bg-muted" />
                      <div className="h-2.5 w-64 max-w-full animate-pulse rounded-md bg-muted" />
                    </div>
                  </div>
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
                  <p className="text-sm font-medium">No products found</p>
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
                className="cursor-pointer hover:bg-brand-soft/60"
                onClick={() => onOpen(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-3 py-2.5 first:pl-4 last:pr-4"
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

          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
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
