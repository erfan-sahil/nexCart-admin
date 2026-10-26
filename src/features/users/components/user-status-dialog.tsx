import { useState } from "react"
import { Ban, CircleCheck, UserRound } from "lucide-react"

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
import { cn } from "@/lib/utils"

import { useSetUserStatusMutation } from "../hooks"
import type { AdminUser } from "../types"

type UserStatusDialogProps = {
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

function UserStatusForm({
  user,
  onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  const setUserStatus = useSetUserStatusMutation()
  const [error, setError] = useState<string | null>(null)
  const suspending = user.status === "active"
  const name = fullName(user.firstName, user.lastName) || "Unnamed user"
  const roleLabel = ROLE_LABEL[user.role]
  const actionLabel = suspending ? "Suspend" : "Activate"

  const confirm = async () => {
    setError(null)

    try {
      await setUserStatus.mutateAsync({
        id: user.id,
        payload: { status: suspending ? "suspended" : "active" },
      })
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update this account status. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !setUserStatus.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader
          className={cn(
            "shrink-0 border-b px-6 py-6 text-left",
            suspending
              ? "border-destructive/20 bg-destructive/8"
              : "border-brand/20 bg-brand-soft"
          )}
        >
          <div className="flex items-center gap-4 pr-8">
            <span
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-2xl text-base font-semibold shadow-sm ring-4 ring-background",
                suspending
                  ? "bg-destructive text-white"
                  : "bg-brand text-brand-foreground"
              )}
            >
              {initials(user.firstName, user.lastName)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {actionLabel} {roleLabel.toLowerCase()} account
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
            {suspending ? "Suspend" : "Activate"}{" "}
            <span className="font-medium wrap-break-word text-foreground">
              {user.email}
            </span>
            .
            {suspending
              ? " They will not be able to sign in until the account is activated again."
              : " They will be able to sign in again."}
            {user.role === "vendor"
              ? suspending
                ? " Their store will be suspended and its products hidden."
                : " Their store suspension will be lifted."
              : null}
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
            disabled={setUserStatus.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={suspending ? "destructive" : "default"}
            className="cursor-pointer"
            onClick={() => void confirm()}
            disabled={setUserStatus.isPending}
          >
            {suspending ? <Ban /> : <CircleCheck />}
            {setUserStatus.isPending
              ? suspending
                ? "Suspending…"
                : "Activating…"
              : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UserStatusDialog({
  user,
  open,
  onClose,
}: UserStatusDialogProps) {
  if (!open || !user) {
    return null
  }

  return <UserStatusForm key={user.id} user={user} onClose={onClose} />
}
