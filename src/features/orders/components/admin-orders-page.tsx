import { useMemo, useState } from "react"
import { Loader2, Search } from "lucide-react"
import { useNavigate } from "react-router"

import { badgeColors, UniversalBadge } from "@/components/shared"
import {
  dataTableTabSectionHeader,
  dataTableTabStrip,
  dataTableTabsList,
  dataTableTabTrigger,
} from "@/components/shared/data-table-section"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDebouncedValue } from "@/hooks"
import { ApiError } from "@/lib/api/errors"

import { useAdminOrders } from "../hooks"
import { FULFILLMENT_STATUS_LABEL } from "../labels"
import type { AdminOrderListItem } from "../types/admin-orders.types"
import { AdminOrdersTable } from "./admin-orders-table"

const FULFILLMENT_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: FULFILLMENT_STATUS_LABEL.pending },
  { value: "processing", label: FULFILLMENT_STATUS_LABEL.processing },
  {
    value: "partially_fulfilled",
    label: FULFILLMENT_STATUS_LABEL.partially_fulfilled,
  },
  { value: "fulfilled", label: FULFILLMENT_STATUS_LABEL.fulfilled },
  { value: "cancelled", label: FULFILLMENT_STATUS_LABEL.cancelled },
] as const

const PAYMENT_FILTERS = [
  { value: "all", label: "All payments" },
  { value: "unpaid", label: "Unpaid" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
] as const

export function AdminOrdersPageContent() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [fulfillmentTab, setFulfillmentTab] = useState<string>("all")
  const [paymentStatus, setPaymentStatus] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const fulfillmentStatus = fulfillmentTab === "all" ? "" : fulfillmentTab

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-createdAt" as const,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(fulfillmentStatus ? { fulfillmentStatus } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    }),
    [page, pageSize, debouncedSearch, fulfillmentStatus, paymentStatus]
  )

  const listQuery = useAdminOrders(params)
  const items = listQuery.data?.items ?? []
  const pagination = listQuery.data?.pagination

  const errorMessage =
    listQuery.error instanceof ApiError
      ? listQuery.error.message
      : listQuery.isError
        ? "Could not load orders."
        : null

  const openOrder = (order: AdminOrderListItem) => {
    navigate(`/commerce/orders/${order.id}`)
  }

  const table = (
    <AdminOrdersTable
      items={items}
      isLoading={listQuery.isLoading}
      isFetching={listQuery.isFetching}
      errorMessage={errorMessage}
      emptyLabel="Try another search, fulfillment tab, or payment filter."
      page={pagination?.page ?? page}
      pageSize={pagination?.limit ?? pageSize}
      total={pagination?.total ?? 0}
      totalPages={pagination?.totalPages ?? 0}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onRetry={() => void listQuery.refetch()}
      onOpen={openOrder}
    />
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <div className="mb-4">
          <h1 className="font-display text-xl font-semibold tracking-tight">
            All orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search by order number, filter payment, and browse fulfillment by
            tab.
          </p>
        </div>
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="orders-search">Search orders</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="orders-search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Order number"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-56">
            <FieldLabel htmlFor="orders-payment">Payment</FieldLabel>
            <Select
              value={paymentStatus || "all"}
              onValueChange={(value) => {
                setPaymentStatus(value === "all" ? "" : value)
                setPage(1)
              }}
            >
              <SelectTrigger id="orders-payment" className="h-10! w-full">
                <SelectValue placeholder="All payments" />
              </SelectTrigger>
              <SelectContent align="end">
                {PAYMENT_FILTERS.map((option) => (
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
        <Tabs
          value={fulfillmentTab}
          onValueChange={(value) => {
            setFulfillmentTab(value)
            setPage(1)
          }}
          className="gap-0"
        >
          <div className={dataTableTabSectionHeader}>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-sm font-semibold">Fulfillment</h2>
              <UniversalBadge
                name={pagination ? String(pagination.total) : "—"}
                colors={badgeColors.neutral}
                showDot={false}
                className="normal-case tabular-nums"
              />
            </div>
            {listQuery.isFetching && !listQuery.isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Refreshing
              </span>
            ) : null}
          </div>
          <div className={dataTableTabStrip}>
            <TabsList className={dataTableTabsList}>
              {FULFILLMENT_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={dataTableTabTrigger}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value={fulfillmentTab} className="mt-0">
            {table}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
