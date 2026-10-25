import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
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

const fieldClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

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
        aria-labelledby="edit-user-title"
        className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-5 text-card-foreground shadow-lg"
      >
        <div className="mb-4">
          <h2 id="edit-user-title" className="text-base font-semibold">
            Edit user
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {fullName(user.firstName, user.lastName)} · {user.email}
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">First name</span>
              <input
                className={fieldClass}
                value={form.firstName}
                onChange={(event) => setField("firstName")(event.target.value)}
                required
                maxLength={50}
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Last name</span>
              <input
                className={fieldClass}
                value={form.lastName}
                onChange={(event) => setField("lastName")(event.target.value)}
                required
                maxLength={50}
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              className={fieldClass}
              value={form.email}
              onChange={(event) => setField("email")(event.target.value)}
              required
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Phone</span>
            <input
              className={fieldClass}
              value={form.phone}
              onChange={(event) => setField("phone")(event.target.value)}
              placeholder="+8801712345678"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Role</span>
              <select
                className={fieldClass}
                value={form.role}
                onChange={(event) =>
                  setField("role")(event.target.value as UserRole)
                }
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Status</span>
              <select
                className={fieldClass}
                value={form.status}
                onChange={(event) =>
                  setField("status")(event.target.value as UserStatus)
                }
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function UserEditDialog({ user, open, onClose }: UserEditDialogProps) {
  if (!open || !user) {
    return null
  }

  return <UserEditForm key={user.id} user={user} onClose={onClose} />
}
