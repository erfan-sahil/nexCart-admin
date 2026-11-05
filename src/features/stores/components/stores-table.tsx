import { ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react"

import { UniversalBadge, badgeColors } from "@/components/shared"
import { Button } from "@/components/ui/button"
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
}: StoresTableProps) {
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-10 px-3 first:pl-4">Store</TableHead>
            <TableHead className="h-10 px-3">Status</TableHead>
            <TableHead className="h-10 px-3">Rating</TableHead>
            <TableHead className="h-10 px-3">Products</TableHead>
            <TableHead className="h-10 px-3">Sales</TableHead>
            <TableHead className="h-10 px-3">Joined</TableHead>
            <TableHead className="h-10 w-14 px-3 text-right last:pr-4">
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
            <TableRow className="hover:bg-transparent">
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
            <TableRow className="hover:bg-transparent">
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
                  <TableCell className="px-3 py-3 text-right last:pr-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`View ${store.name}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onOpen(store)
                      }}
                    >
                      <Eye />
                    </Button>
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
