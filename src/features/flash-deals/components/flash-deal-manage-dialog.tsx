import { useState } from "react"
import { Loader2, Pencil, Plus, Trash2, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ApiError } from "@/lib/api/errors"

import { formatDealDate } from "../datetime"
import { useFlashDealQuery, useRemoveFlashDealItemMutation } from "../hooks"
import { formatDiscount } from "../labels"
import type {
  FlashDealCampaign,
  FlashDealItem,
  FlashDealStatus,
} from "../types"
import { FlashDealItemFormDialog } from "./flash-deal-item-form-dialog"

type FlashDealManageDialogProps = {
  campaignId: string | null
  status: FlashDealStatus
  open: boolean
  onClose: () => void
}

function FlashDealManageContent({
  campaignId,
  status,
  onClose,
}: {
  campaignId: string
  status: FlashDealStatus
  onClose: () => void
}) {
  const detail = useFlashDealQuery(campaignId)
  const removeItem = useRemoveFlashDealItemMutation(campaignId)
  const [adding, setAdding] = useState(false)
  const [editingItem, setEditingItem] = useState<FlashDealItem | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const campaign = detail.data
  const ended = status === "ended"

  const remove = async (item: FlashDealItem) => {
    setActionError(null)
    setRemovingId(item.id)

    try {
      await removeItem.mutateAsync(item.id)
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Could not remove this product."
      )
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <>
      <Dialog
        open
        onOpenChange={(next) => {
          if (!next) {
            onClose()
          }
        }}
      >
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
            <div className="flex items-center gap-4 pr-8">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
                <Zap className="size-6" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="truncate text-lg font-semibold">
                  {campaign?.name ?? "Flash deal"}
                </DialogTitle>
                <DialogDescription className="mt-1 text-foreground/70">
                  {campaign
                    ? `${formatDealDate(campaign.startsAt)} → ${formatDealDate(campaign.endsAt)}`
                    : "Loading deal…"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {actionError ? (
              <p role="alert" className="px-6 pt-4 text-sm text-destructive">
                {actionError}
              </p>
            ) : null}

            {detail.isLoading ? (
              <div className="flex items-center gap-2 px-6 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading products…
              </div>
            ) : detail.isError ? (
              <p className="px-6 py-8 text-sm text-destructive">
                {detail.error instanceof ApiError
                  ? detail.error.message
                  : "Could not load this flash deal."}
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 px-6 pt-4">
                  <p className="text-sm font-medium">
                    Products ({campaign?.items.length ?? 0})
                  </p>
                  {!ended ? (
                    <Button
                      type="button"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => {
                        setEditingItem(null)
                        setAdding(true)
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add product
                    </Button>
                  ) : null}
                </div>

                <ScrollArea
                  type="auto"
                  className="min-h-0 flex-1 overflow-hidden"
                  viewportClassName="h-auto max-h-[min(28rem,calc(100dvh-18rem))]"
                >
                  {(campaign?.items.length ?? 0) === 0 ? (
                    <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No products yet.
                      {!ended
                        ? " Add products to run them on this schedule."
                        : null}
                    </p>
                  ) : (
                    <ul className="divide-y px-2 py-2">
                      {campaign?.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-lg px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {item.productName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.storeName} ·{" "}
                              {formatDiscount(
                                item.discountType,
                                item.discountValue
                              )}
                            </p>
                          </div>
                          {!ended ? (
                            <div className="flex shrink-0 items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer"
                                aria-label={`Edit ${item.productName}`}
                                onClick={() => {
                                  setAdding(false)
                                  setEditingItem(item)
                                }}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer text-destructive"
                                aria-label={`Remove ${item.productName}`}
                                disabled={removingId === item.id}
                                onClick={() => void remove(item)}
                              >
                                {removingId === item.id ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                              </Button>
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollArea>
              </>
            )}
          </div>

          <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {campaign ? (
        <FlashDealItemFormDialog
          campaign={campaign as FlashDealCampaign}
          item={null}
          open={adding}
          onClose={() => setAdding(false)}
        />
      ) : null}
      {campaign && editingItem ? (
        <FlashDealItemFormDialog
          campaign={campaign as FlashDealCampaign}
          item={editingItem}
          open
          onClose={() => setEditingItem(null)}
        />
      ) : null}
    </>
  )
}

export function FlashDealManageDialog({
  campaignId,
  status,
  open,
  onClose,
}: FlashDealManageDialogProps) {
  if (!open || !campaignId) {
    return null
  }

  return (
    <FlashDealManageContent
      key={campaignId}
      campaignId={campaignId}
      status={status}
      onClose={onClose}
    />
  )
}
