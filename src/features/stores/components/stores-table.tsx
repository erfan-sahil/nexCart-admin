import {
  Ban,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Eye,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react"

import { UniversalBadge, badgeColors } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { StoreAvatar } from "@/features/finance/components/finance-ui"
import { formatBdt } from "@/features/finance/lib/format"
import { formatDate } from "@/lib/format"

import { STORE_LISTING_STATUS_LABEL, storeListingStatus } from "../labels"
import type { AdminStoreSummary } from "../types"

const STATUS_BADGE: Record<
  ReturnType<typeof storeListingStatus>,
  (typeof badgeColors)[keyof typeof badgeColors]
> = {
  listed: badgeColors.active,
  suspended: badgeColors.suspended,
  closed: badgeColors.neutral,
}

type StoresTableProps = {
  items: AdminStoreSummary[]
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  emptyLabel: string
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onRetry: () => void
  onOpen: (store: AdminStoreSummary) => void
  onBan: (store: AdminStoreSummary) => void
  onDelete: (store: AdminStoreSummary) => void
}

export function StoresTable({
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
  onRetry,
  onOpen,
  onBan,
  onDelete,
}: StoresTableProps) {
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Sales</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-14 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell colSpan={7} className="px-4 py-3">
                  <div className="h-10 animate-pulse rounded-md bg-muted" />
                </TableCell>
              </TableRow>
            ))
          ) : errorMessage ? (
            <TableRow>
              <TableCell colSpan={7} className="px-5 py-16">
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
            <TableRow>
              <TableCell colSpan={7} className="px-5 py-16">
                <div className="mx-auto max-w-md text-center">
                  <p className="text-sm font-medium">No stores found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {emptyLabel}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((store) => {
              const status = storeListingStatus(store)

              return (
                <TableRow
                  key={store.id}
                  className="cursor-pointer"
                  onClick={() => onOpen(store)}
                >
                  <TableCell className="px-3 py-3 first:pl-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <StoreAvatar name={store.name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {store.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {store.slug} · {store.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <UniversalBadge
                      name={STORE_LISTING_STATUS_LABEL[status]}
                      colors={STATUS_BADGE[status]}
                      showDot
                    />
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm tabular-nums">
                    {store.rating.average.toFixed(1)}
                    <span className="text-muted-foreground">
                      {" "}
                      ({store.rating.count})
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm tabular-nums">
                    {store.totalProducts}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm tabular-nums">
                    {formatBdt(store.totalSales)}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-sm text-muted-foreground">
                    {formatDate(store.joinedAt)}
                  </TableCell>
                  <TableCell
                    className="px-3 py-3 text-right last:pr-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer"
                            aria-label={`Actions for ${store.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onSelect={() => {
                              window.setTimeout(() => onOpen(store), 0)
                            }}
                          >
                            <Eye className="size-3.5" />
                            Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => {
                              window.setTimeout(() => onBan(store), 0)
                            }}
                          >
                            {store.isSuspended ? (
                              <CircleCheck className="size-3.5" />
                            ) : (
                              <Ban className="size-3.5" />
                            )}
                            {store.isSuspended ? "Lift ban" : "Ban store"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => {
                              window.setTimeout(() => onDelete(store), 0)
                            }}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {!isLoading && !errorMessage && total > 0 ? (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-muted-foreground tabular-nums">
            {rangeStart}–{rangeEnd} of {total}
            {isFetching ? (
              <Loader2 className="ml-2 inline size-3.5 animate-spin align-[-2px]" />
            ) : null}
          </p>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
