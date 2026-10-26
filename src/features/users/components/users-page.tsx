import { useCallback, useMemo, useState } from "react"
import { Loader2, Search } from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UserStatus } from "@/features/auth/types"
import { useDebouncedValue } from "@/hooks"
import { ApiError } from "@/lib/api/errors"

import { useUsersQuery } from "../hooks"
import type { AdminUser, UsersPageRole } from "../types"
import { UserDeleteDialog } from "./user-delete-dialog"
import { UserDetailsDialog } from "./user-details-dialog"
import { UserEditDialog } from "./user-edit-dialog"
import { UserStatusDialog } from "./user-status-dialog"
import { UsersTable } from "./users-table"

type UsersPageProps = {
  role: UsersPageRole
  emptyLabel: string
  rowDetails?: boolean
}

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
] as const

export function UsersPage({
  role,
  emptyLabel,
  rowDetails = false,
}: UsersPageProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<UserStatus | "">("")
  const [viewing, setViewing] = useState<AdminUser | null>(null)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState<AdminUser | null>(null)
  const [statusUser, setStatusUser] = useState<AdminUser | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 350)
  const title = role === "customer" ? "Buyers" : "Vendors"

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      role,
      sort: "-createdAt" as const,
      ...(status ? { status } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, role, status, debouncedSearch]
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

  const handleEdit = useCallback((user: AdminUser) => {
    setEditing(user)
  }, [])

  const handleDelete = useCallback((user: AdminUser) => {
    setDeleting(user)
  }, [])

  const handleToggleStatus = useCallback((user: AdminUser) => {
    setStatusUser(user)
  }, [])

  const handleRowClick = useCallback((user: AdminUser) => {
    setViewing(user)
  }, [])

  const handleEditFromDetails = useCallback((user: AdminUser) => {
    setViewing(null)
    setEditing(user)
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor={`${role}-search`}>Search</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id={`${role}-search`}
                className="h-10"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Name, email, or phone"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-56">
            <FieldLabel htmlFor={`${role}-status`}>Status</FieldLabel>
            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setStatus(value === "all" ? "" : (value as UserStatus))
                setPage(1)
              }}
            >
              <SelectTrigger id={`${role}-status`} className="h-10! w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent align="end">
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold">{title}</h2>
            <UniversalBadge
              name={pagination ? String(pagination.total) : "—"}
              colors={badgeColors.neutral}
              showDot={false}
              className="normal-case tabular-nums"
            />
          </div>
          {users.isFetching && !users.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>
        <UsersTable
          items={items}
          isLoading={users.isLoading}
          isFetching={users.isFetching}
          errorMessage={errorMessage}
          emptyLabel={emptyLabel}
          page={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => void users.refetch()}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onRowClick={rowDetails ? handleRowClick : undefined}
        />
      </section>

      {rowDetails ? (
        <UserDetailsDialog
          user={viewing}
          open={Boolean(viewing)}
          onClose={() => setViewing(null)}
          onEdit={handleEditFromDetails}
        />
      ) : null}

      <UserEditDialog
        user={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      />
      <UserStatusDialog
        user={statusUser}
        open={Boolean(statusUser)}
        onClose={() => setStatusUser(null)}
      />
      <UserDeleteDialog
        user={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
