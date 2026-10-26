import { useMemo } from "react"
import { flexRender, type PaginationState } from "@tanstack/react-table"
import {
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy"
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

import { CATEGORY_LEVEL_LABEL } from "../labels"
import type { Category } from "../types"

const PAGE_SIZES = [10, 20, 50] as const

type CategoriesTableProps = {
  items: Category[]
  parentNames: Map<string, string>
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
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
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

export function CategoriesTable({
  items,
  parentNames,
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
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const columns = useMemo<LegacyColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {row.original.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.slug}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => (
          <UniversalBadge
            name={CATEGORY_LEVEL_LABEL[row.original.level]}
            colors={
              row.original.level === 1
                ? badgeColors.buyer
                : row.original.level === 2
                  ? badgeColors.vendor
                  : badgeColors.neutral
            }
            showDot={false}
            className="normal-case"
          />
        ),
      },
      {
        accessorKey: "parentId",
        header: "Parent",
        cell: ({ row }) => {
          const parentId = row.original.parentId

          return (
            <span className="text-muted-foreground">
              {parentId ? (parentNames.get(parentId) ?? "—") : "—"}
            </span>
          )
        },
      },
      {
        accessorKey: "sortOrder",
        header: "Sort",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {row.original.sortOrder}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <UniversalBadge
            name={row.original.isActive ? "active" : "inactive"}
            colors={
              row.original.isActive ? badgeColors.active : badgeColors.neutral
            }
          />
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const category = row.original

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer"
                    aria-label={`Actions for ${category.name}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onSelect={() => {
                      window.setTimeout(() => onEdit(category), 0)
                    }}
                  >
                    <Pencil />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => {
                      window.setTimeout(() => onDelete(category), 0)
                    }}
                  >
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [onDelete, onEdit, parentNames]
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
                  <div className="flex flex-col gap-2">
                    <div className="h-3 w-40 animate-pulse rounded-md bg-muted" />
                    <div className="h-2.5 w-24 animate-pulse rounded-md bg-muted" />
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
                  <p className="text-sm font-medium">No categories found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a category to organize the catalog.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-brand-soft/60"
                onClick={() => onEdit(row.original)}
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
