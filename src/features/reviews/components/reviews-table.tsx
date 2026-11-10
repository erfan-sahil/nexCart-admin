import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Trash2,
} from "@/lib/icons"

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
import { formatDateTime } from "@/lib/format"

import type { ManagementReview } from "../types"
import { ReviewStars } from "./review-stars"

type ReviewsTableProps = {
  items: ManagementReview[]
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
  onOpen: (review: ManagementReview) => void
  onDelete: (review: ManagementReview) => void
}

export function ReviewsTable({
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
  onDelete,
}: ReviewsTableProps) {
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rating</TableHead>
            <TableHead>Reviewer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Replies</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-16 text-right">
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
                  <p className="text-sm font-medium">No reviews found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {emptyLabel}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((review) => (
              <TableRow
                key={review.id}
                className="cursor-pointer hover:bg-brand-soft/60"
                onClick={() => onOpen(review)}
              >
                <TableCell className="px-3 py-2.5 first:pl-4">
                  <ReviewStars rating={review.rating} />
                </TableCell>
                <TableCell className="max-w-40 px-3 py-2.5">
                  <p className="truncate text-sm font-medium">
                    {review.author.displayName}
                  </p>
                </TableCell>
                <TableCell className="max-w-44 px-3 py-2.5">
                  <p className="truncate text-sm font-medium">
                    {review.product.name}
                  </p>
                  {review.product.slug ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {review.product.slug}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="max-w-36 px-3 py-2.5">
                  <p className="truncate text-sm">{review.store.name}</p>
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="size-3.5" />
                      {review.replyCount}
                    </span>
                    {review.hasVendorReply ? (
                      <UniversalBadge
                        name="Seller replied"
                        colors={badgeColors.approved}
                        showDot={false}
                        className="normal-case"
                      />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {formatDateTime(review.createdAt)}
                </TableCell>
                <TableCell
                  className="px-3 py-2.5 text-right last:pr-4"
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
                          aria-label={`Actions for review by ${review.author.displayName}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onSelect={() => {
                            window.setTimeout(() => onOpen(review), 0)
                          }}
                        >
                          <Eye className="size-3.5" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => {
                            window.setTimeout(() => onDelete(review), 0)
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
            ))
          )}
        </TableBody>
      </Table>

      {!isLoading && !errorMessage ? (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-muted-foreground">
            {total === 0
              ? "No results"
              : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
            {isFetching ? (
              <span className="ml-2 inline-flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" />
                Refreshing
              </span>
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || totalPages === 0}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
