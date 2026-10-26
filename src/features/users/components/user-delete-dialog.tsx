import { useState } from "react"
import { Trash2, UserRound } from "lucide-react"

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
import type { UserRole } from "@/features/auth/types"
import { ApiError } from "@/lib/api/errors"
import { fullName } from "@/lib/format"

import { useDeleteUserMutation } from "../hooks"
import type { AdminUser } from "../types"

type UserDeleteDialogProps = {
  user: AdminUser | null
  open: boolean
  onClose: () => void
}

const ROLE_LABEL: Record<UserRole, string> = {
  customer: "Buyer",
  vendor: "Vendor",
  admin: "Admin",
}

function initials(firstName: string, lastName: string) {
  const letters = `${firstName} ${lastName}`
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

function UserDeleteForm({
  user,
  onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  const deleteUser = useDeleteUserMutation()
  const [error, setError] = useState<string | null>(null)
  const name = fullName(user.firstName, user.lastName) || "Unnamed user"
  const roleLabel = ROLE_LABEL[user.role]

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
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !deleteUser.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-destructive/20 bg-destructive/8 px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive text-base font-semibold text-white shadow-sm ring-4 ring-background">
              {initials(user.firstName, user.lastName)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Delete {roleLabel.toLowerCase()} account
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={user.status}
                  colors={badgeColors[user.status]}
                />
                <UniversalBadge
                  name={roleLabel}
                  icon={UserRound}
                  colors={
                    user.role === "customer"
                      ? badgeColors.buyer
                      : badgeColors.neutral
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
              {user.email}
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
            disabled={deleteUser.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            onClick={() => void confirm()}
            disabled={deleteUser.isPending}
          >
            <Trash2 />
            {deleteUser.isPending
              ? "Deleting…"
              : `Delete ${roleLabel.toLowerCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UserDeleteDialog({
  user,
  open,
  onClose,
}: UserDeleteDialogProps) {
  if (!open || !user) {
    return null
  }

  return <UserDeleteForm key={user.id} user={user} onClose={onClose} />
}
