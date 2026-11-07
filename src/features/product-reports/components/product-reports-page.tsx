import { useCallback, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api/errors"

import {
  useProductReportsQuery,
  useUpdateProductReportStatusMutation,
} from "../hooks"
import { STATUS_FILTER_LABEL } from "../labels"
import type { ProductReport, StatusFilter } from "../types"
import { ProductReportsTable } from "./product-reports-table"
import { ReportDeleteDialog } from "./report-delete-dialog"
import { ReportDetailDialog } from "./report-detail-dialog"

const STATUS_FILTERS: StatusFilter[] = ["all", "open", "reviewed", "dismissed"]

export function ProductReportsPageContent() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open")
  const [viewing, setViewing] = useState<ProductReport | null>(null)
  const [deleting, setDeleting] = useState<ProductReport | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    }),
    [page, pageSize, statusFilter]
  )

  const reportsQuery = useProductReportsQuery(params)
  const updateStatus = useUpdateProductReportStatusMutation()
  const items = reportsQuery.data?.items ?? []
  const pagination = reportsQuery.data?.pagination
  const errorMessage =
    reportsQuery.error instanceof ApiError
      ? reportsQuery.error.message
      : reportsQuery.isError
        ? "Could not load reports."
        : null

  const handleOpen = useCallback((report: ProductReport) => {
    setActionError(null)
    setViewing(report)
  }, [])

  const handleDelete = useCallback((report: ProductReport) => {
    setDeleting(report)
  }, [])

  const handleStatusUpdate = useCallback(
    async (report: ProductReport, status: "reviewed" | "dismissed") => {
      setActionError(null)

      try {
        const updated = await updateStatus.mutateAsync({
          reportId: report.id,
          payload: { status },
        })
        setViewing(updated)
      } catch (error) {
        setActionError(
          error instanceof ApiError
            ? error.message
            : "Could not update this report."
        )
      }
    },
    [updateStatus]
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Reports
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Buyer complaints about product listings. Open a row to review details
          and mark the report as handled.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="sm:w-52">
            <FieldLabel htmlFor="admin-report-status">Status</FieldLabel>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as StatusFilter)
                setPage(1)
              }}
            >
              <SelectTrigger id="admin-report-status" className="h-10! w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter} value={filter}>
                    {STATUS_FILTER_LABEL[filter]}
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
            <h2 className="text-sm font-semibold">Product reports</h2>
            <UniversalBadge
              name={pagination ? String(pagination.total) : "—"}
              colors={badgeColors.neutral}
              showDot={false}
              className="normal-case tabular-nums"
            />
          </div>
          {reportsQuery.isFetching && !reportsQuery.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>

        <ProductReportsTable
          items={items}
          isLoading={reportsQuery.isLoading}
          isFetching={reportsQuery.isFetching}
          errorMessage={errorMessage}
          emptyLabel={
            statusFilter !== "all"
              ? `No ${STATUS_FILTER_LABEL[statusFilter].toLowerCase()} reports.`
              : "No product reports have been submitted yet."
          }
          page={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
          onRetry={() => void reportsQuery.refetch()}
          onOpen={handleOpen}
          onDelete={handleDelete}
        />
      </section>

      <ReportDetailDialog
        report={viewing}
        open={Boolean(viewing)}
        updating={updateStatus.isPending}
        actionError={actionError}
        onClose={() => {
          setViewing(null)
          setActionError(null)
        }}
        onMarkReviewed={(report) => {
          void handleStatusUpdate(report, "reviewed")
        }}
        onDismiss={(report) => {
          void handleStatusUpdate(report, "dismissed")
        }}
      />
      <ReportDeleteDialog
        report={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onDeleted={(reportId) => {
          if (viewing?.id === reportId) {
            setViewing(null)
          }
        }}
      />
    </div>
  )
}
