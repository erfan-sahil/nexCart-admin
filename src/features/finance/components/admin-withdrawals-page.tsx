"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Banknote,
  CircleDollarSign,
  Clock,
  Loader2,
  Wallet,
} from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api/errors"

import { badgeColors, UniversalBadge } from "@/components/shared"
import {
  dataTableBodyCell,
  dataTableHeadCell,
  dataTableTabSectionHeader,
  dataTableTabStrip,
  dataTableTabsList,
  dataTableTabTrigger,
} from "@/components/shared/data-table-section"

import {
  FinanceLayout,
  FinancePageIntro,
  FinanceStatCard,
  FinanceStatGrid,
  FinanceTablePagination,
  FinanceTableSkeleton,
  PayoutMethodBadge,
  WithdrawalStatusBadge,
} from "./finance-ui"
import { sumWithdrawalAmount } from "../lib/aggregates"
import {
  formatBdt,
  formatFinanceDateTime,
  maskAccountNumber,
} from "../lib/format"
import { WITHDRAWAL_STATUS_TABS } from "../constants"
import {
  listAdminWithdrawals,
  reviewWithdrawal,
  type WithdrawalRow,
} from "../services/admin-finance.api"

export function AdminWithdrawalsPage() {
  const queryClient = useQueryClient()
  const [statusTab, setStatusTab] = useState<string>("pending")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const statusFilter = statusTab === "all" ? undefined : statusTab

  const query = useQuery({
    queryKey: ["admin", "withdrawals", statusFilter ?? "all", page, pageSize],
    queryFn: () =>
      listAdminWithdrawals({ page, limit: pageSize, status: statusFilter }),
  })

  const review = useMutation({
    mutationFn: (payload: {
      withdrawalId: string
      body: {
        action: "approve" | "reject" | "processing" | "paid"
        reviewNote?: string
        payoutReference?: string
      }
    }) => reviewWithdrawal(payload.withdrawalId, payload.body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "withdrawals"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "vendor-earnings"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "finance"],
        }),
      ])
    },
  })

  const [paidTarget, setPaidTarget] = useState<WithdrawalRow | null>(null)
  const [payoutReference, setPayoutReference] = useState("")
  const [paidError, setPaidError] = useState<string | null>(null)

  const [rejectTarget, setRejectTarget] = useState<WithdrawalRow | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [rejectError, setRejectError] = useState<string | null>(null)

  const items = useMemo(() => query.data?.items ?? [], [query.data?.items])
  const pagination = query.data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1

  const pendingPreview = useQuery({
    queryKey: ["admin", "withdrawals", "pending-preview"],
    queryFn: () =>
      listAdminWithdrawals({ page: 1, limit: 100, status: "pending" }),
  })

  const pendingItems = pendingPreview.data?.items ?? []
  const pendingTotal =
    pendingPreview.data?.pagination?.total ?? pendingItems.length
  const pendingAmount = sumWithdrawalAmount(pendingItems)

  const errorMessage =
    query.error instanceof ApiError
      ? query.error.message
      : query.isError
        ? "Could not load withdrawals."
        : null

  const showPagination = !query.isLoading && !errorMessage && total > 0

  const table = useMemo(() => {
    if (query.isLoading) {
      return <FinanceTableSkeleton />
    }

    if (errorMessage) {
      return (
        <div className="px-4 py-12 text-center sm:px-5">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void query.refetch()}
          >
            Try again
          </Button>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-5">
          No withdrawal requests in this queue.
        </p>
      )
    }

    return (
      <>
        <div className="overflow-x-auto">
          <Table className="text-sm">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className={dataTableHeadCell}>Requested</TableHead>
                <TableHead className={dataTableHeadCell}>Store</TableHead>
                <TableHead className={dataTableHeadCell}>Payout</TableHead>
                <TableHead className={`${dataTableHeadCell} text-right`}>
                  Amount
                </TableHead>
                <TableHead className={dataTableHeadCell}>Status</TableHead>
                <TableHead className={`${dataTableHeadCell} text-right`}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell
                    className={`${dataTableBodyCell} text-xs text-muted-foreground`}
                  >
                    {formatFinanceDateTime(row.createdAt)}
                  </TableCell>
                  <TableCell className={dataTableBodyCell}>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] text-muted-foreground">
                        {row.storeId ?? "—"}
                      </p>
                      <p className="truncate text-sm leading-tight">
                        {row.accountHolderName ?? "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className={dataTableBodyCell}>
                    <div className="space-y-0.5">
                      <PayoutMethodBadge method={row.method} />
                      <p className="text-[11px] text-muted-foreground">
                        {maskAccountNumber(row.accountNumber)}
                      </p>
                      {row.payoutReference ? (
                        <p className="truncate text-[11px] text-muted-foreground">
                          Ref: {row.payoutReference}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`${dataTableBodyCell} text-right text-sm font-medium tabular-nums`}
                  >
                    {formatBdt(row.amount)}
                  </TableCell>
                  <TableCell className={dataTableBodyCell}>
                    <WithdrawalStatusBadge status={row.status} />
                    {row.reviewNote ? (
                      <p className="mt-0.5 max-w-[12rem] truncate text-[11px] text-muted-foreground">
                        {row.reviewNote}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className={`${dataTableBodyCell} text-right`}>
                    <WithdrawalActions
                      row={row}
                      busy={review.isPending}
                      onApprove={() =>
                        review.mutate({
                          withdrawalId: row.id,
                          body: { action: "approve" },
                        })
                      }
                      onProcessing={() =>
                        review.mutate({
                          withdrawalId: row.id,
                          body: { action: "processing" },
                        })
                      }
                      onReject={() => {
                        setRejectTarget(row)
                        setRejectNote("")
                        setRejectError(null)
                      }}
                      onPaid={() => {
                        setPaidTarget(row)
                        setPayoutReference("")
                        setPaidError(null)
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {showPagination ? (
          <FinanceTablePagination
            page={pagination?.page ?? page}
            pageSize={pagination?.limit ?? pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            isFetching={query.isFetching}
          />
        ) : null}
      </>
    )
  }, [
    errorMessage,
    items,
    page,
    pageSize,
    pagination,
    query,
    review,
    showPagination,
    total,
    totalPages,
  ])

  return (
    <FinanceLayout>
      <FinancePageIntro
        title="Withdrawals"
        description="Review vendor payout requests, move them through approval, and record payout references when paid."
      />

      <FinanceStatGrid>
        <FinanceStatCard
          icon={Clock}
          tone="warning"
          label="Pending queue"
          value={String(pendingTotal)}
          detail="Requests waiting for a decision"
        />
        <FinanceStatCard
          icon={CircleDollarSign}
          tone="brand"
          label="Pending amount"
          value={formatBdt(pendingAmount)}
          detail="Total BDT in the pending queue"
        />
        <FinanceStatCard
          icon={Wallet}
          tone="info"
          label="In this filter"
          value={String(total)}
          detail={
            statusTab === "all"
              ? "All withdrawal statuses"
              : `${WITHDRAWAL_STATUS_TABS.find((t) => t.value === statusTab)?.label ?? statusTab} requests`
          }
        />
        <FinanceStatCard
          icon={Banknote}
          tone="success"
          label="On this page"
          value={formatBdt(sumWithdrawalAmount(items))}
          detail="Sum of amounts listed below"
        />
      </FinanceStatGrid>

      <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <Tabs
          value={statusTab}
          onValueChange={(value) => {
            setStatusTab(value)
            setPage(1)
          }}
          className="gap-0"
        >
          <div className={dataTableTabSectionHeader}>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-sm font-semibold">Payout queue</h2>
              <UniversalBadge
                name={pagination ? String(pagination.total) : "—"}
                colors={badgeColors.neutral}
                showDot={false}
                className="normal-case tabular-nums"
              />
            </div>
            {query.isFetching && !query.isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Refreshing
              </span>
            ) : null}
          </div>
          <div className={dataTableTabStrip}>
            <TabsList className={dataTableTabsList}>
              {WITHDRAWAL_STATUS_TABS.map((tab) => (
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
          <TabsContent value={statusTab} className="mt-0">
            {table}
          </TabsContent>
        </Tabs>
      </section>

      <Dialog
        open={paidTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPaidTarget(null)
            setPayoutReference("")
            setPaidError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as paid</DialogTitle>
            <DialogDescription>
              Record the bank or mobile-money reference for{" "}
              {paidTarget ? formatBdt(paidTarget.amount) : "this withdrawal"}.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="payoutReference">Payout reference</FieldLabel>
            <Input
              id="payoutReference"
              value={payoutReference}
              onChange={(e) => setPayoutReference(e.target.value)}
              placeholder="Transaction id or bank reference"
            />
          </Field>
          {paidError ? (
            <p className="text-sm text-destructive">{paidError}</p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPaidTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={review.isPending}
              onClick={async () => {
                if (!paidTarget) {
                  return
                }

                const ref = payoutReference.trim()

                if (!ref) {
                  setPaidError("Payout reference is required.")
                  return
                }

                setPaidError(null)

                try {
                  await review.mutateAsync({
                    withdrawalId: paidTarget.id,
                    body: { action: "paid", payoutReference: ref },
                  })
                  setPaidTarget(null)
                  setPayoutReference("")
                } catch (err) {
                  setPaidError(
                    err instanceof ApiError
                      ? err.message
                      : "Could not update withdrawal."
                  )
                }
              }}
            >
              {review.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                "Confirm paid"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null)
            setRejectNote("")
            setRejectError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject withdrawal</DialogTitle>
            <DialogDescription>
              Funds return to the vendor available balance. Add an optional note
              they can see in the record.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="rejectNote">Review note</FieldLabel>
            <Textarea
              id="rejectNote"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason for rejection (optional)"
              rows={3}
            />
          </Field>
          {rejectError ? (
            <p className="text-sm text-destructive">{rejectError}</p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={review.isPending}
              onClick={async () => {
                if (!rejectTarget) {
                  return
                }

                setRejectError(null)

                try {
                  await review.mutateAsync({
                    withdrawalId: rejectTarget.id,
                    body: {
                      action: "reject",
                      reviewNote: rejectNote.trim() || "Rejected by admin",
                    },
                  })
                  setRejectTarget(null)
                  setRejectNote("")
                } catch (err) {
                  setRejectError(
                    err instanceof ApiError
                      ? err.message
                      : "Could not reject withdrawal."
                  )
                }
              }}
            >
              Reject request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FinanceLayout>
  )
}

function WithdrawalActions({
  row,
  busy,
  onApprove,
  onProcessing,
  onReject,
  onPaid,
}: {
  row: WithdrawalRow
  busy: boolean
  onApprove: () => void
  onProcessing: () => void
  onReject: () => void
  onPaid: () => void
}) {
  if (row.status === "pending") {
    return (
      <div className="flex flex-wrap justify-end gap-1">
        <Button
          size="sm"
          className="h-7 px-2.5 text-xs"
          disabled={busy}
          onClick={onApprove}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          disabled={busy}
          onClick={onReject}
        >
          Reject
        </Button>
      </div>
    )
  }

  if (row.status === "approved") {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="h-7 px-2.5 text-xs"
        disabled={busy}
        onClick={onProcessing}
      >
        Processing
      </Button>
    )
  }

  if (row.status === "processing") {
    return (
      <Button
        size="sm"
        className="h-7 px-2.5 text-xs"
        disabled={busy}
        onClick={onPaid}
      >
        Mark paid
      </Button>
    )
  }

  return <span className="text-xs text-muted-foreground">—</span>
}
