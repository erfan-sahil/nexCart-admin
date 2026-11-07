import { useCallback, useMemo, useState } from "react"
import { Loader2, Search } from "lucide-react"

import {
  AdminPageIntro,
  badgeColors,
  UniversalBadge,
} from "@/components/shared"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebouncedValue } from "@/hooks"
import { ApiError } from "@/lib/api/errors"

import { useAdminReviewsQuery } from "../hooks"
import { RATING_FILTER_LABEL } from "../labels"
import type { ManagementReview, RatingFilter } from "../types"
import { ReviewDeleteDialog } from "./review-delete-dialog"
import { ReviewDetailDialog } from "./review-detail-dialog"
import { ReviewsTable } from "./reviews-table"

const RATING_FILTERS: RatingFilter[] = ["all", "5", "4", "3", "2", "1"]

export function ReviewsPageContent() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")
  const [viewing, setViewing] = useState<ManagementReview | null>(null)
  const [deleting, setDeleting] = useState<ManagementReview | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(ratingFilter !== "all" ? { rating: Number(ratingFilter) } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, ratingFilter, debouncedSearch]
  )

  const reviewsQuery = useAdminReviewsQuery(params)
  const items = reviewsQuery.data?.items ?? []
  const pagination = reviewsQuery.data?.pagination
  const errorMessage =
    reviewsQuery.error instanceof ApiError
      ? reviewsQuery.error.message
      : reviewsQuery.isError
        ? "Could not load reviews."
        : null

  const handleOpen = useCallback((review: ManagementReview) => {
    setViewing(review)
  }, [])

  const handleDelete = useCallback((review: ManagementReview) => {
    setDeleting(review)
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageIntro />

      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="admin-review-search">Search</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="admin-review-search"
                className="h-10"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search by comment or product name"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-44">
            <FieldLabel htmlFor="admin-review-rating">Rating</FieldLabel>
            <Select
              value={ratingFilter}
              onValueChange={(value) => {
                setRatingFilter(value as RatingFilter)
                setPage(1)
              }}
            >
              <SelectTrigger id="admin-review-rating" className="h-10! w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {RATING_FILTERS.map((filter) => (
                  <SelectItem key={filter} value={filter}>
                    {RATING_FILTER_LABEL[filter]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold">Reviews</h2>
            <UniversalBadge
              name={pagination ? String(pagination.total) : "—"}
              colors={badgeColors.neutral}
              showDot={false}
              className="normal-case tabular-nums"
            />
          </div>
          {reviewsQuery.isFetching && !reviewsQuery.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>

        <ReviewsTable
          items={items}
          isLoading={reviewsQuery.isLoading}
          isFetching={reviewsQuery.isFetching}
          errorMessage={errorMessage}
          emptyLabel={
            debouncedSearch || ratingFilter !== "all"
              ? "No reviews match these filters."
              : "No buyer reviews have been posted yet."
          }
          page={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
          onRetry={() => void reviewsQuery.refetch()}
          onOpen={handleOpen}
          onDelete={handleDelete}
        />
      </section>

      <ReviewDetailDialog
        review={viewing}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
      />
      <ReviewDeleteDialog
        review={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onDeleted={(reviewId) => {
          if (viewing?.id === reviewId) {
            setViewing(null)
          }
        }}
      />
    </div>
  )
}
