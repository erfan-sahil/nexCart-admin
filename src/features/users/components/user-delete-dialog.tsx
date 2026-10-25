import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"
import { fullName } from "@/lib/format"

import { useDeleteUserMutation } from "../hooks"
import type { AdminUser } from "../types"

type UserDeleteDialogProps = {
  user: AdminUser | null
  open: boolean
  onClose: () => void
}

export function UserDeleteDialog({
  user,
  open,
  onClose,
}: UserDeleteDialogProps) {
  const deleteUser = useDeleteUserMutation()
  const [error, setError] = useState<string | null>(null)

  if (!open || !user) {
    return null
  }

  const confirm = async () => {
    setError(null)

    try {
      await deleteUser.mutateAsync(user.id)
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not delete this user. Please try again."
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-5 text-card-foreground shadow-lg"
      >
        <h2 id="delete-user-title" className="text-base font-semibold">
          Delete user
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Delete{" "}
          <span className="font-medium text-foreground">
            {fullName(user.firstName, user.lastName)}
          </span>{" "}
          ({user.email})? This cannot be undone.
        </p>

        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteUser.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void confirm()}
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}
