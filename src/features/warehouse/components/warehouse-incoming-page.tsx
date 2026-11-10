import { useMemo, useState } from "react"
import { Loader2, Search } from "@/lib/icons"
import { useNavigate } from "react-router"

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

import { useAdminVendorOrders } from "@/features/orders/hooks"

import { WarehouseIncomingTable } from "./warehouse-incoming-table"

const STATUS_FILTERS = [
  { value: "sending_to_warehouse", label: "In transit" },
  { value: "received_at_warehouse", label: "Received" },
  { value: "inspecting", label: "Inspecting" },
  { value: "partially_accepted", label: "Partially accepted" },
  { value: "rejected_at_warehouse", label: "Rejected" },
] as const

export function WarehouseIncomingPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("sending_to_warehouse")
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-updatedAt" as const,
      ...(status ? { status } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, status, debouncedSearch]
  )

  const queue = useAdminVendorOrders(params)
  const items = queue.data?.items ?? []
  const pagination = queue.data?.pagination

  const errorMessage =
    queue.error instanceof ApiError
      ? queue.error.message
      : queue.isError
        ? "Could not load inbound queue."
        : null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Incoming vendor orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vendor slices in the unified status pipeline — receive, inspect, and
            return rejects from the parent order detail.
          </p>
        </div>
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="warehouse-search">Search</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="warehouse-search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Vendor or parent order number"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-56">
            <FieldLabel htmlFor="warehouse-status">Status</FieldLabel>
            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setStatus(value === "all" ? "" : value)
                setPage(1)
              }}
            >
              <SelectTrigger id="warehouse-status" className="h-10! w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All warehouse statuses</SelectItem>
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

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Queue</h2>
            <UniversalBadge
              name={pagination ? String(pagination.total) : "—"}
              colors={badgeColors.neutral}
              showDot={false}
              className="normal-case tabular-nums"
            />
          </div>
          {queue.isFetching && !queue.isLoading ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>
        <WarehouseIncomingTable
          items={items}
          isLoading={queue.isLoading}
          isFetching={queue.isFetching}
          errorMessage={errorMessage}
          page={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => void queue.refetch()}
          onManage={(row) => navigate(`/commerce/orders/${row.parentOrderId}`)}
        />
      </section>
    </div>
  )
}
