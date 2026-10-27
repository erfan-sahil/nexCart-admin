import { useCallback, useMemo, useState } from "react"
import { Loader2, Search } from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
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

import { useProductsForModerationQuery } from "../hooks"
import { PRODUCT_APPROVAL_LABEL } from "../labels"
import {
  PRODUCT_APPROVAL_STATUSES,
  type Product,
  type ProductApprovalStatus,
} from "../types"
import { ProductApprovalDialog } from "./product-approval-dialog"
import { ProductApprovalsTable } from "./product-approvals-table"

const STATUS_FILTERS = [
  { value: "all", label: "All approvals" },
  ...PRODUCT_APPROVAL_STATUSES.map((status) => ({
    value: status,
    label: PRODUCT_APPROVAL_LABEL[status],
  })),
] as const

export function ProductApprovalsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [approvalStatus, setApprovalStatus] = useState<
    ProductApprovalStatus | ""
  >("submitted")
  const [selected, setSelected] = useState<{
    id: string
    mode: "details" | "review"
  } | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-createdAt" as const,
      ...(approvalStatus ? { approvalStatus } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, approvalStatus, debouncedSearch]
  )

  const products = useProductsForModerationQuery(params)
  const items = products.data?.items ?? []
  const pagination = products.data?.pagination
  const errorMessage =
    products.error instanceof ApiError
      ? products.error.message
      : products.isError
        ? "Could not load products."
        : null

  const handleOpen = useCallback((product: Product) => {
    setSelected({ id: product.id, mode: "details" })
  }, [])

  const handleReview = useCallback((product: Product) => {
    setSelected({ id: product.id, mode: "review" })
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="product-approval-search">Search</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="product-approval-search"
                className="h-10"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Name, description, or tag"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-56">
            <FieldLabel htmlFor="product-approval-status">Approval</FieldLabel>
            <Select
              value={approvalStatus || "all"}
              onValueChange={(value) => {
                setApprovalStatus(
                  value === "all" ? "" : (value as ProductApprovalStatus)
                )
                setPage(1)
              }}
            >
              <SelectTrigger
                id="product-approval-status"
                className="h-10! w-full"
              >
                <SelectValue placeholder="Submitted" />
              </SelectTrigger>
              <SelectContent align="end">
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
            <h2 className="text-sm font-semibold">Products</h2>
            <UniversalBadge
              name={pagination ? String(pagination.total) : "—"}
              colors={badgeColors.neutral}
              showDot={false}
              className="normal-case tabular-nums"
            />
          </div>
          {products.isFetching && !products.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>

        <ProductApprovalsTable
          items={items}
          isLoading={products.isLoading}
          isFetching={products.isFetching}
          errorMessage={errorMessage}
          emptyLabel={
            approvalStatus === "submitted"
              ? "No products are waiting for approval."
              : "No products match these filters."
          }
          page={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => void products.refetch()}
          onOpen={handleOpen}
          onReview={handleReview}
        />
      </section>

      <ProductApprovalDialog
        productId={selected?.id ?? null}
        mode={selected?.mode ?? "details"}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onReview={() =>
          setSelected((current) =>
            current ? { ...current, mode: "review" } : current
          )
        }
      />
    </div>
  )
}
