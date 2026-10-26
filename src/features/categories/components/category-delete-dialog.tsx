import { useState } from "react"
import { FolderTree, Trash2 } from "lucide-react"

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

import { useDeleteCategoryMutation } from "../hooks"
import { CATEGORY_LEVEL_LABEL } from "../labels"
import type { Category } from "../types"

type CategoryDeleteDialogProps = {
  category: Category | null
  open: boolean
  onClose: () => void
  onDeleted: () => void
}

function CategoryDeleteForm({
  category,
  onClose,
  onDeleted,
}: {
  category: Category
  onClose: () => void
  onDeleted: () => void
}) {
  const deleteCategory = useDeleteCategoryMutation()
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    setError(null)

    try {
      await deleteCategory.mutateAsync(category.id)
      onDeleted()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not delete this category. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !deleteCategory.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-destructive/20 bg-destructive/8 px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive text-white shadow-sm ring-4 ring-background">
              <FolderTree className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {category.name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Delete category
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={CATEGORY_LEVEL_LABEL[category.level]}
                  colors={
                    category.level === 1
                      ? badgeColors.buyer
                      : category.level === 2
                        ? badgeColors.vendor
                        : badgeColors.neutral
                  }
                  showDot={false}
                  className="normal-case"
                />
                <UniversalBadge
                  name={category.isActive ? "active" : "inactive"}
                  colors={
                    category.isActive ? badgeColors.active : badgeColors.neutral
                  }
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
              {category.name}
            </span>
            . This cannot be undone. Delete child categories first.
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
            disabled={deleteCategory.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            onClick={() => void confirm()}
            disabled={deleteCategory.isPending}
          >
            <Trash2 />
            {deleteCategory.isPending ? "Deleting…" : "Delete category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CategoryDeleteDialog({
  category,
  open,
  onClose,
  onDeleted,
}: CategoryDeleteDialogProps) {
  if (!open || !category) {
    return null
  }

  return (
    <CategoryDeleteForm
      key={category.id}
      category={category}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  )
}
