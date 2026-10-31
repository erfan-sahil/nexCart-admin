import { useState } from "react"
import { Zap } from "lucide-react"

import { UniversalBadge } from "@/components/shared"
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

import { formatDealDate } from "../datetime"
import { useEndFlashDealMutation } from "../hooks"
import { FLASH_DEAL_STATUS_BADGE } from "../labels"
import type { FlashDealCampaign, FlashDealStatus } from "../types"

type FlashDealEndDialogProps = {
  campaign: FlashDealCampaign | null
  status: FlashDealStatus
  open: boolean
  onClose: () => void
}

function FlashDealEndForm({
  campaign,
  status,
  onClose,
}: {
  campaign: FlashDealCampaign
  status: FlashDealStatus
  onClose: () => void
}) {
  const endDeal = useEndFlashDealMutation()
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    setError(null)

    try {
      await endDeal.mutateAsync(campaign.id)
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not end this flash deal. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !endDeal.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-destructive/20 bg-destructive/8 px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive text-white shadow-sm ring-4 ring-background">
              <Zap className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {campaign.name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                End flash deal
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={status}
                  colors={FLASH_DEAL_STATUS_BADGE[status]}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-6 py-5">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <p className="text-sm text-muted-foreground">
            End{" "}
            <span className="font-medium text-foreground">{campaign.name}</span>{" "}
            now? All {campaign.itemCount} product
            {campaign.itemCount === 1 ? "" : "s"} leave the storefront flash
            section immediately.
          </p>
          <p className="text-xs text-muted-foreground">
            Scheduled through {formatDealDate(campaign.endsAt)}.
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={endDeal.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            disabled={endDeal.isPending}
            onClick={() => void confirm()}
          >
            {endDeal.isPending ? "Ending…" : "End deal now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function FlashDealEndDialog({
  campaign,
  status,
  open,
  onClose,
}: FlashDealEndDialogProps) {
  if (!open || !campaign) {
    return null
  }

  return (
    <FlashDealEndForm
      key={campaign.id}
      campaign={campaign}
      status={status}
      onClose={onClose}
    />
  )
}
