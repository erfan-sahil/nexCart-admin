import { useState } from "react"
import { Flag, Trash2 } from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiError } from "@/lib/api/errors"

import { useDeleteProductReportMutation } from "../hooks"
import {
  PRODUCT_REPORT_STATUS_BADGE,
  PRODUCT_REPORT_STATUS_LABEL,
  PRODUCT_REPORT_TYPE_LABEL,
} from "../labels"
import type { ProductReport } from "../types"

type ReportDeleteDialogProps = {
  report: ProductReport | null
  open: boolean
  onClose: () => void
  onDeleted?: (reportId: string) => void
}

function reporterInitials(displayName: string) {
  const letters = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

function ReportDeleteForm({
  report,
  onClose,
  onDeleted,
}: {
  report: ProductReport
  onClose: () => void
  onDeleted?: (reportId: string) => void
}) {
  const deleteReport = useDeleteProductReportMutation()
  const [error, setError] = useState<string | null>(null)
  const reporterName = report.reporter.displayName || "Anonymous reporter"

  const confirm = async () => {
    setError(null)

    try {
      await deleteReport.mutateAsync(report.id)
      onDeleted?.(report.id)
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not delete this report. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !deleteReport.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-destructive/20 bg-destructive/8 px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive text-base font-semibold text-white shadow-sm ring-4 ring-background">
              {reporterInitials(reporterName)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {reporterName}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Delete product report
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={PRODUCT_REPORT_TYPE_LABEL[report.type]}
                  icon={Flag}
                  colors={badgeColors.under_review}
                  showDot={false}
                  className="normal-case"
                />
                <UniversalBadge
                  name={PRODUCT_REPORT_STATUS_LABEL[report.status]}
                  colors={PRODUCT_REPORT_STATUS_BADGE[report.status]}
                  showDot={false}
                  className="normal-case"
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          {error ? (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <p className="text-sm text-muted-foreground">
            Permanently delete this report about{" "}
            <span className="font-medium wrap-break-word text-foreground">
              {report.product.name}
            </span>
            . This cannot be undone.
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
            disabled={deleteReport.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            onClick={() => void confirm()}
            disabled={deleteReport.isPending}
          >
            <Trash2 />
            {deleteReport.isPending ? "Deleting…" : "Delete report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ReportDeleteDialog({
  report,
  open,
  onClose,
  onDeleted,
}: ReportDeleteDialogProps) {
  if (!open || !report) {
    return null
  }

  return (
    <ReportDeleteForm
      key={report.id}
      report={report}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  )
}
