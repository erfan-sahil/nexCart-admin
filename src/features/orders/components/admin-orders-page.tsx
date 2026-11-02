"use client"

import { Loader2, Search } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDebouncedValue } from "@/hooks"
import { ApiError } from "@/lib/api/errors"

import {
  useAdminOrder,
  useAdminOrders,
  useCancelAdminOrder,
} from "../hooks/use-admin-orders"

function AdminOrderDetailDialog({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const detail = useAdminOrder(orderId ?? "")
  const cancel = useCancelAdminOrder()
  const order = detail.data
  const [error, setError] = useState<string | null>(null)

  const onCancel = async () => {
    if (!order) return
    setError(null)
    try {
      await cancel.mutateAsync(order.id)
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not cancel order."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order?.orderNumber ?? "Order"}</DialogTitle>
        </DialogHeader>
        {detail.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : order ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Fulfillment:</span>{" "}
                {order.fulfillmentStatus}
              </p>
              <p>
                <span className="text-muted-foreground">Payment:</span>{" "}
                {order.paymentStatus}
              </p>
              <p>
                <span className="text-muted-foreground">Method:</span>{" "}
                {order.paymentMethod}
              </p>
              <p>
                <span className="text-muted-foreground">Total:</span>{" "}
                {order.currency} {order.grandTotal.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Ship to</h3>
              <p className="text-muted-foreground">
                {order.shipping.recipientName} · {order.shipping.phone}
                <br />
                {order.shipping.line1}, {order.shipping.city}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Vendor orders</h3>
              <ul className="mt-2 divide-y rounded-md border">
                {order.vendorOrders.map((vo) => (
                  <li key={vo.id} className="flex justify-between px-3 py-2">
                    <span>
                      {vo.vendorOrderNumber} · {vo.storeName}
                    </span>
                    <span className="text-muted-foreground">{vo.status}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Activity</h3>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {order.activity.length === 0 ? (
                  <li>No activity yet.</li>
                ) : (
                  order.activity.map((row) => (
                    <li key={row.id}>
                      {row.action} · {row.actorRole} ·{" "}
                      {new Date(row.createdAt).toLocaleString()}
                    </li>
                  ))
                )}
              </ul>
            </div>
            {error ? <p className="text-destructive">{error}</p> : null}
            {order.canCancel ? (
              <Button
                variant="destructive"
                disabled={cancel.isPending}
                onClick={onCancel}
              >
                Cancel order
              </Button>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export function AdminOrdersPageContent() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 350)
  const params = useMemo(
    () => ({
      limit: 50,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [debouncedSearch]
  )
  const listQuery = useAdminOrders(params)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const items = listQuery.data?.items ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          All orders
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Parent checkout orders and each vendor&apos;s fulfillment progress.
        </p>
      </div>

      <InputGroup className="max-w-md">
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search order number"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </InputGroup>

      {listQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Vendors</TableHead>
                <TableHead className="text-right">Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(order.id)}
                  >
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.fulfillmentStatus}</TableCell>
                    <TableCell>{order.paymentStatus}</TableCell>
                    <TableCell>{order.vendorOrderCount}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminOrderDetailDialog
        orderId={selectedId}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      />
    </div>
  )
}
