import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
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
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"

import { useAdminReturns } from "../hooks"
import { RETURN_KIND_LABEL, formatMoney, returnStatusBadge } from "../labels"

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

export function AdminReturnsPageContent() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("all")
  const [kind, setKind] = useState("all")

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      ...(status !== "all" ? { status } : {}),
      ...(kind !== "all" ? { kind } : {}),
    }),
    [page, status, kind]
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

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Returns
        </h1>
        <p className="text-sm text-muted-foreground">
          Delivery failures and in-delivery rejections awaiting warehouse
          handling.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
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
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kind" />
          </SelectTrigger>
          <SelectContent>
            {KIND_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {listQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-7 animate-spin text-muted-foreground" />
          </div>
        ) : errorMessage ? (
          <p className="px-4 py-12 text-center text-sm text-destructive">
            {errorMessage}
          </p>
        ) : items.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            No delivery returns yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Cash refund</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => {
                const badge = returnStatusBadge(row.status)

                return (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() =>
                      void navigate(`/commerce/orders/${row.parentOrderId}`)
                    }
                  >
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {RETURN_KIND_LABEL[row.kind] ?? row.kind}
                    </TableCell>
                    <TableCell>
                      <UniversalBadge
                        name={badge.name}
                        colors={badge.colors}
                        icon={badge.icon}
                      />
                    </TableCell>
                    <TableCell className="max-w-[16rem] truncate text-sm text-muted-foreground">
                      {row.reason}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {formatMoney("BDT", row.cashRefundAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="ghost" size="sm" asChild>
                        <Link
                          to={`/commerce/orders/${row.parentOrderId}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          Open order
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </section>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || listQuery.isFetching}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || listQuery.isFetching}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
