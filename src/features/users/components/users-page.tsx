import { useMemo, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { UserStatus } from "@/features/auth/types"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime, fullName } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useUsersQuery } from "../hooks"
import type { AdminUser, UsersPageRole } from "../types"
import { UserDeleteDialog } from "./user-delete-dialog"
import { UserEditDialog } from "./user-edit-dialog"

type UsersPageProps = {
  role: UsersPageRole
  emptyLabel: string
}

const fieldClass =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const STATUS_CLASS: Record<UserStatus, string> = {
  active: "bg-brand-soft text-brand-text",
  suspended: "bg-destructive/10 text-destructive",
}

export function UsersPage({ role, emptyLabel }: UsersPageProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<UserStatus | "">("")
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState<AdminUser | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      role,
      sort: "-createdAt" as const,
      ...(status ? { status } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, role, status, debouncedSearch]
  )

  const users = useUsersQuery(params)
  const items = users.data?.items ?? []
  const pagination = users.data?.pagination
  const errorMessage =
    users.error instanceof ApiError
      ? users.error.message
      : users.isError
        ? "Could not load users."
        : null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="block min-w-0 flex-1 space-y-1.5 text-sm">
            <span className="font-medium">Search</span>
            <input
              className={cn(fieldClass, "w-full")}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Name, email, or phone"
            />
          </label>
          <label className="block space-y-1.5 text-sm sm:w-44">
            <span className="font-medium">Status</span>
            <select
              className={cn(fieldClass, "w-full")}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as UserStatus | "")
                setPage(1)
              }}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold">
              {role === "customer" ? "Buyers" : "Vendors"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {pagination
                ? `${pagination.total} account${pagination.total === 1 ? "" : "s"}`
                : "Loading accounts…"}
            </p>
          </div>
          {users.isFetching && !users.isLoading ? (
            <span className="text-xs text-muted-foreground">Refreshing…</span>
          ) : null}
        </div>

        {users.isLoading ? (
          <div className="px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
            Loading users…
          </div>
        ) : errorMessage ? (
          <div className="px-4 py-16 text-center sm:px-6">
            <p className="text-sm font-medium text-destructive">
              {errorMessage}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void users.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-16 text-center sm:px-6">
            <p className="text-sm font-medium">No records found</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {emptyLabel}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium sm:px-5">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last login</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium sm:px-5">
                      {fullName(user.firstName, user.lastName)}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-1 text-xs font-medium capitalize",
                          STATUS_CLASS[user.status]
                        )}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(user.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${user.email}`}
                          onClick={() => setEditing(user)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${user.email}`}
                          onClick={() => setDeleting(user)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || users.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  pagination.page >= pagination.totalPages || users.isFetching
                }
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <UserEditDialog
        user={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      />
      <UserDeleteDialog
        user={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
