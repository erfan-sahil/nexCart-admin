import { CheckCircle2, Loader2, XCircle } from "lucide-react"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDateTime } from "@/lib/format"

import {
  PRODUCT_REPORT_STATUS_BADGE,
  PRODUCT_REPORT_STATUS_LABEL,
  PRODUCT_REPORT_TYPE_LABEL,
} from "../labels"
import type { ProductReport } from "../types"

type ReportDetailDialogProps = {
  report: ProductReport | null
  open: boolean
  updating: boolean
  onClose: () => void
  onMarkReviewed: (report: ProductReport) => void
  onDismiss: (report: ProductReport) => void
}

export function ReportDetailDialog({
  report,
  open,
  updating,
  onClose,
  onMarkReviewed,
  onDismiss,
}: ReportDetailDialogProps) {
  const isOpen = report?.status === "open"

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (!next ? onClose() : undefined)}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Product report</DialogTitle>
          <DialogDescription>
            Review the buyer complaint and mark it as handled.
          </DialogDescription>
        </DialogHeader>

        {report ? (
          <DialogBody
            scrollClassName="min-h-0 flex-1"
            className="space-y-4 px-0 py-0"
          >
            <div className="flex flex-wrap items-center gap-2">
              <UniversalBadge
                name={PRODUCT_REPORT_STATUS_LABEL[report.status]}
                colors={PRODUCT_REPORT_STATUS_BADGE[report.status]}
                className="normal-case"
              />
              <span className="text-xs text-muted-foreground">
                {formatDateTime(report.createdAt)}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Reason
              </p>
              <p className="text-sm font-medium">
                {PRODUCT_REPORT_TYPE_LABEL[report.type]}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Message
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {report.message}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Product
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {report.product.name}
                </p>
                {report.product.slug ? (
                  <p className="text-xs text-muted-foreground">
                    {report.product.slug}
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Store
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {report.store.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Reported by {report.reporter.displayName}
                </p>
              </div>
            </div>
          </DialogBody>
        ) : null}

        <DialogFooter className="shrink-0 gap-2 sm:justify-between">
          {isOpen ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!report || updating}
                onClick={() => {
                  if (report) {
                    onMarkReviewed(report)
                  }
                }}
              >
                {updating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Mark reviewed
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!report || updating}
                onClick={() => {
                  if (report) {
                    onDismiss(report)
                  }
                }}
              >
                <XCircle className="size-4" />
                Dismiss
              </Button>
            </div>
          ) : (
            <span />
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
