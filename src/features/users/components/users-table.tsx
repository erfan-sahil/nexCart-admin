import { useMemo } from "react"
import { flexRender, type PaginationState } from "@tanstack/react-table"
import {
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy"
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Eye,
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
import { formatDateTime, fullName } from "@/lib/format"
import { cn } from "@/lib/utils"

import type { AdminUser } from "../types"

const PAGE_SIZES = [10, 20, 50] as const

type UsersTableProps = {
  items: AdminUser[]
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
  onEdit: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
  onToggleStatus: (user: AdminUser) => void
  onRowClick?: (user: AdminUser) => void
}

function initials(user: AdminUser) {
  const letters = `${user.firstName} ${user.lastName}`
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
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

export function UsersTable({
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
  onEdit,
  onDelete,
  onToggleStatus,
  onRowClick,
}: UsersTableProps) {
  const columns = useMemo<LegacyColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "Name",
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-text">
                {initials(user)}
              </span>
              <p className="truncate font-medium text-foreground">
                {fullName(user.firstName, user.lastName)}
              </p>
            </div>
          )
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {row.original.phone ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <UniversalBadge
            name={row.original.status}
            colors={badgeColors[row.original.status]}
          />
        ),
      },
      {
        accessorKey: "lastLoginAt",
        header: "Last login",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDateTime(row.original.lastLoginAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const user = row.original
          const name = fullName(user.firstName, user.lastName)
          const suspending = user.status === "active"

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer"
                    aria-label={`Actions for ${name}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {onRowClick ? (
                    <DropdownMenuItem
                      onSelect={() => {
                        window.setTimeout(() => onRowClick(user), 0)
                      }}
                    >
                      <Eye />
                      Details
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    onSelect={() => {
                      window.setTimeout(() => onEdit(user), 0)
                    }}
                  >
                    <Pencil />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      window.setTimeout(() => onToggleStatus(user), 0)
                    }}
                  >
                    {suspending ? <Ban /> : <CircleCheck />}
                    {suspending ? "Suspend" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => {
                      window.setTimeout(() => onDelete(user), 0)
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
    [onDelete, onEdit, onRowClick, onToggleStatus]
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
                    <div className="size-8 animate-pulse rounded-full bg-muted" />
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
                  <p className="text-sm font-medium">No records found</p>
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
                className={cn(
                  "hover:bg-brand-soft/60",
                  onRowClick && "cursor-pointer"
                )}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
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
