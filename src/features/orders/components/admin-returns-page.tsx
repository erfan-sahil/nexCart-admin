import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api/errors"

import { useAdminReturns } from "../hooks"
import type { AdminReturnListItem } from "../types/admin-orders.types"
import { AdminDeliveryReturnsTable } from "./admin-delivery-returns-table"
import { AdminOrderDetailsDialog } from "./admin-order-details-dialog"
import { VendorReturnShipmentsPanel } from "./vendor-return-shipments-panel"

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "pending_warehouse_receipt", label: "Pending warehouse receipt" },
  { value: "received_at_warehouse", label: "Received at warehouse" },
  { value: "refund_processing", label: "Refund processing" },
  { value: "refunded", label: "Refunded" },
  { value: "damaged", label: "Damaged" },
  { value: "inspection_rejected", label: "Inspection rejected" },
] as const

const KIND_FILTERS = [
  { value: "all", label: "All kinds" },
  { value: "delivery_failed", label: "Delivery failed" },
  { value: "customer_rejected", label: "Customer rejected" },
] as const

const VENDOR_STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "pending_dispatch_to_vendor", label: "Pending dispatch" },
  { value: "in_transit_to_vendor", label: "In transit" },
  { value: "received_by_vendor", label: "Received by vendor" },
] as const

export function AdminReturnsPageContent() {
  const navigate = useNavigate()
  const [tab, setTab] = useState("delivery")
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [status, setStatus] = useState("all")
  const [kind, setKind] = useState("all")
  const [vendorStatus, setVendorStatus] = useState("all")

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(status !== "all" ? { status } : {}),
      ...(kind !== "all" ? { kind } : {}),
    }),
    [page, pageSize, status, kind]
  )

  const listQuery = useAdminReturns(params)
  const items = listQuery.data?.items ?? []
  const pagination = listQuery.data?.pagination

  const errorMessage =
    listQuery.error instanceof ApiError
      ? listQuery.error.message
      : listQuery.isError
        ? "Could not load returns."
        : null

  const openOrder = (returnItem: AdminReturnListItem) => {
    navigate(`/commerce/orders/${returnItem.parentOrderId}`)
  }

  const showOrderDetails = (returnItem: AdminReturnListItem) => {
    setDetailsOrderId(returnItem.parentOrderId)
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <AdminPageIntro
        trailing={
          tab === "delivery" ? (
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
          ) : null
        }
      />

      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value)
            setPage(1)
          }}
          className="gap-0"
        >
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 overflow-x-auto">
              <TabsList className={dataTableTabsList}>
                <TabsTrigger value="delivery" className={dataTableTabTrigger}>
                  Delivery returns
                </TabsTrigger>
                <TabsTrigger value="vendor" className={dataTableTabTrigger}>
                  Return to vendor
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
              {tab === "delivery" ? (
                <>
                  <Select
                    value={status}
                    onValueChange={(value) => {
                      setStatus(value)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger
                      className="h-9! w-full bg-background sm:w-56"
                      aria-label="Return status"
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {STATUS_FILTERS.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={kind}
                    onValueChange={(value) => {
                      setKind(value)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger
                      className="h-9! w-full bg-background sm:w-48"
                      aria-label="Return kind"
                    >
                      <SelectValue placeholder="Kind" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {KIND_FILTERS.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <Select value={vendorStatus} onValueChange={setVendorStatus}>
                  <SelectTrigger
                    className="h-9! w-full bg-background sm:w-56"
                    aria-label="Shipment status"
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {VENDOR_STATUS_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <TabsContent value="delivery" className="mt-0">
            <AdminDeliveryReturnsTable
              items={items}
              isLoading={listQuery.isLoading}
              isFetching={listQuery.isFetching}
              errorMessage={errorMessage}
              emptyLabel="Try another status or kind filter."
              page={pagination?.page ?? page}
              pageSize={pagination?.limit ?? pageSize}
              total={pagination?.total ?? 0}
              totalPages={pagination?.totalPages ?? 0}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onRetry={() => void listQuery.refetch()}
              onDetails={showOrderDetails}
              onOpen={openOrder}
            />
          </TabsContent>

          <TabsContent value="vendor" className="mt-0">
            <VendorReturnShipmentsPanel embedded status={vendorStatus} />
          </TabsContent>
        </Tabs>
      </section>

      <AdminOrderDetailsDialog
        orderId={detailsOrderId}
        open={Boolean(detailsOrderId)}
        onClose={() => setDetailsOrderId(null)}
        onUpdate={(order) => {
          setDetailsOrderId(null)
          navigate(`/commerce/orders/${order.id}`)
        }}
      />
    </div>
  )
}
