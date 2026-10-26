import { useState } from "react"
import { SlidersHorizontal, Trash2 } from "lucide-react"

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

import { useDeleteAttributeMutation } from "../hooks"
import { ATTRIBUTE_ROLE_LABEL, ATTRIBUTE_TYPE_LABEL } from "../labels"
import type { Attribute } from "../types"

type AttributeDeleteDialogProps = {
  attribute: Attribute | null
  open: boolean
  onClose: () => void
  onDeleted: () => void
}

function AttributeDeleteForm({
  attribute,
  onClose,
  onDeleted,
}: {
  attribute: Attribute
  onClose: () => void
  onDeleted: () => void
}) {
  const deleteAttribute = useDeleteAttributeMutation()
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    setError(null)

    try {
      await deleteAttribute.mutateAsync(attribute.id)
      onDeleted()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not delete this attribute. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !deleteAttribute.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-destructive/20 bg-destructive/8 px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive text-white shadow-sm ring-4 ring-background">
              <SlidersHorizontal className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {attribute.name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Delete attribute
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={ATTRIBUTE_TYPE_LABEL[attribute.type]}
                  colors={badgeColors.neutral}
                  showDot={false}
                  className="normal-case"
                />
                <UniversalBadge
                  name={ATTRIBUTE_ROLE_LABEL[attribute.role]}
                  colors={
                    attribute.role === "variant"
                      ? badgeColors.vendor
                      : badgeColors.buyer
                  }
                  showDot={false}
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
            Permanently delete{" "}
            <span className="font-medium wrap-break-word text-foreground">
              {attribute.name}
            </span>
            . This cannot be undone. Attributes assigned to a category have to
            be removed there first.
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
            disabled={deleteAttribute.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            onClick={() => void confirm()}
            disabled={deleteAttribute.isPending}
          >
            <Trash2 />
            {deleteAttribute.isPending ? "Deleting…" : "Delete attribute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AttributeDeleteDialog({
  attribute,
  open,
  onClose,
  onDeleted,
}: AttributeDeleteDialogProps) {
  if (!open || !attribute) {
    return null
  }

  return (
    <AttributeDeleteForm
      key={attribute.id}
      attribute={attribute}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  )
}
