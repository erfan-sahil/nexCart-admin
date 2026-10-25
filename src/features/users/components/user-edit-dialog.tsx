import { useState, type FormEvent } from "react"
import { UserRound } from "lucide-react"

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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UserRole, UserStatus } from "@/features/auth/types"
import { ApiError } from "@/lib/api/errors"
import { fullName } from "@/lib/format"

import { useUpdateUserMutation } from "../hooks"
import type { AdminUser, UpdateUserPayload } from "../types"

type UserEditDialogProps = {
  user: AdminUser | null
  open: boolean
  onClose: () => void
}

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
}

const ROLE_LABEL: Record<UserRole, string> = {
  customer: "Buyer",
  vendor: "Vendor",
  admin: "Admin",
}

function toForm(user: AdminUser): FormState {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role,
    status: user.status,
  }
}

function buildPayload(user: AdminUser, form: FormState): UpdateUserPayload {
  const payload: UpdateUserPayload = {}

  if (form.firstName.trim() !== user.firstName) {
    payload.firstName = form.firstName.trim()
  }

  if (form.lastName.trim() !== user.lastName) {
    payload.lastName = form.lastName.trim()
  }

  if (form.email.trim().toLowerCase() !== user.email) {
    payload.email = form.email.trim().toLowerCase()
  }

  const nextPhone = form.phone.trim()
  const currentPhone = user.phone ?? ""

  if (nextPhone !== currentPhone) {
    payload.phone = nextPhone
  }

  if (form.role !== user.role) {
    payload.role = form.role
  }

  if (form.status !== user.status) {
    payload.status = form.status
  }

  return payload
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

function UserEditForm({
  user,
  onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  const updateUser = useUpdateUserMutation()
  const [form, setForm] = useState(() => toForm(user))
  const [error, setError] = useState<string | null>(null)
  const name = fullName(form.firstName, form.lastName) || "Unnamed user"
  const roleLabel = ROLE_LABEL[form.role]

  const setField =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((current) => ({ ...current, [key]: value }))
    }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const payload = buildPayload(user, form)

    if (Object.keys(payload).length === 0) {
      onClose()
      return
    }

    try {
      await updateUser.mutateAsync({ id: user.id, payload })
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update this user. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !updateUser.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-sm ring-4 ring-background">
              {initials(form.firstName, form.lastName)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Edit {roleLabel.toLowerCase()} account
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={form.status}
                  colors={badgeColors[form.status]}
                />
                <UniversalBadge
                  name={roleLabel}
                  icon={UserRound}
                  colors={badgeColors.buyer}
                  showDot={false}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-col"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <ScrollArea
            type="auto"
            className="max-h-[calc(100dvh-16rem)]"
            viewportClassName="max-h-[calc(100dvh-16rem)]"
          >
            <FieldGroup className="gap-4 px-6 py-5">
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="edit-first-name">First name</FieldLabel>
                  <Input
                    id="edit-first-name"
                    className="h-9"
                    value={form.firstName}
                    onChange={(event) =>
                      setField("firstName")(event.target.value)
                    }
                    required
                    maxLength={50}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-last-name">Last name</FieldLabel>
                  <Input
                    id="edit-last-name"
                    className="h-9"
                    value={form.lastName}
                    onChange={(event) =>
                      setField("lastName")(event.target.value)
                    }
                    required
                    maxLength={50}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                <Input
                  id="edit-email"
                  type="email"
                  className="h-9"
                  value={form.email}
                  onChange={(event) => setField("email")(event.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-phone">Phone</FieldLabel>
                <Input
                  id="edit-phone"
                  className="h-9"
                  value={form.phone}
                  onChange={(event) => setField("phone")(event.target.value)}
                  placeholder="+8801712345678"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="edit-role">Role</FieldLabel>
                  <Select
                    value={form.role}
                    onValueChange={(value) =>
                      setField("role")(value as UserRole)
                    }
                  >
                    <SelectTrigger
                      id="edit-role"
                      className="h-9! w-full cursor-pointer"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-status">Status</FieldLabel>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setField("status")(value as UserStatus)
                    }
                  >
                    <SelectTrigger
                      id="edit-status"
                      className="h-9! w-full cursor-pointer"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function UserEditDialog({ user, open, onClose }: UserEditDialogProps) {
  if (!open || !user) {
    return null
  }

  return <UserEditForm key={user.id} user={user} onClose={onClose} />
}
