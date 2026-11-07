import { useMemo, useState } from "react"
import { Loader2, Search } from "lucide-react"
import { useNavigate } from "react-router"

import {
  AdminPageIntro,
  badgeColors,
  UniversalBadge,
} from "@/components/shared"
import {
  dataTableTabsList,
  dataTableTabTrigger,
} from "@/components/shared/data-table-section"
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
import { AdminOrderDetailsDialog } from "./admin-order-details-dialog"
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
  const [viewing, setViewing] = useState<AdminOrderListItem | null>(null)
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

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <AdminPageIntro
        trailing={
          <>
            <UniversalBadge
              name={pagination ? String(pagination.total) : "—"}
              colors={badgeColors.neutral}
              showDot={false}
              className="normal-case tabular-nums"
            />
            {listQuery.isFetching && !listQuery.isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Refreshing
              </span>
            ) : null}
          </>
        }
      />

      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <Tabs
          value={fulfillmentTab}
          onValueChange={(value) => {
            setFulfillmentTab(value)
            setPage(1)
          }}
          className="gap-0"
        >
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 overflow-x-auto">
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

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
              <InputGroup className="h-9 w-full bg-background sm:max-w-xs lg:w-64">
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
                  placeholder="Search order number…"
                  aria-label="Search orders"
                />
              </InputGroup>
              <Select
                value={paymentStatus || "all"}
                onValueChange={(value) => {
                  setPaymentStatus(value === "all" ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger
                  id="orders-payment"
                  className="h-9! w-full bg-background sm:w-44"
                  aria-label="Payment filter"
                >
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
            </div>
          </div>

          <TabsContent value={fulfillmentTab} className="mt-0">
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
              onDetails={setViewing}
              onUpdate={openOrder}
            />
          </TabsContent>
        </Tabs>
      </section>

      <AdminOrderDetailsDialog
        order={viewing}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        onUpdate={(order) => {
          setViewing(null)
          openOrder(order)
        }}
      />
    </div>
  )
}
