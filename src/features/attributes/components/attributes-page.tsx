import { useMemo, useState } from "react"
import { Loader2, Plus, Search } from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
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
import { useDebouncedValue } from "@/hooks"
import { ApiError } from "@/lib/api/errors"

import { useAttributesQuery } from "../hooks"
import { ATTRIBUTE_ROLE_LABEL, ATTRIBUTE_TYPE_LABEL } from "../labels"
import {
  ATTRIBUTE_ROLES,
  ATTRIBUTE_TYPES,
  type Attribute,
  type AttributeRole,
  type AttributeType,
} from "../types"
import {
  AttributeCreateDialog,
  AttributeEditDialog,
} from "./attribute-create-dialog"
import { AttributeDeleteDialog } from "./attribute-delete-dialog"
import { AttributeDetailsDialog } from "./attribute-details-dialog"
import { AttributesTable } from "./attributes-table"

export function AttributesPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [type, setType] = useState<AttributeType | "">("")
  const [role, setRole] = useState<AttributeRole | "">("")
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Attribute | null>(null)
  const [deleting, setDeleting] = useState<Attribute | null>(null)
  const [viewing, setViewing] = useState<Attribute | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-createdAt" as const,
      ...(type ? { type } : {}),
      ...(role ? { role } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, type, role, debouncedSearch]
  )

  const attributes = useAttributesQuery(params)
  const items = attributes.data?.items ?? []
  const pagination = attributes.data?.pagination
  const errorMessage =
    attributes.error instanceof ApiError
      ? attributes.error.message
      : attributes.isError
        ? "Could not load attributes."
        : null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="attribute-search">Search</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="attribute-search"
                className="h-10"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Attribute name"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-48">
            <FieldLabel htmlFor="attribute-type-filter">Type</FieldLabel>
            <Select
              value={type || "all"}
              onValueChange={(value) => {
                setType(value === "all" ? "" : (value as AttributeType))
                setPage(1)
              }}
            >
              <SelectTrigger
                id="attribute-type-filter"
                className="h-10! w-full"
              >
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All types</SelectItem>
                {ATTRIBUTE_TYPES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ATTRIBUTE_TYPE_LABEL[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="sm:w-48">
            <FieldLabel htmlFor="attribute-role-filter">Role</FieldLabel>
            <Select
              value={role || "all"}
              onValueChange={(value) => {
                setRole(value === "all" ? "" : (value as AttributeRole))
                setPage(1)
              }}
            >
              <SelectTrigger
                id="attribute-role-filter"
                className="h-10! w-full"
              >
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All roles</SelectItem>
                {ATTRIBUTE_ROLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ATTRIBUTE_ROLE_LABEL[option]}
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
            <h2 className="text-sm font-semibold">Attributes</h2>
            <UniversalBadge
              name={pagination ? String(pagination.total) : "—"}
              colors={badgeColors.neutral}
              showDot={false}
              className="normal-case tabular-nums"
            />
          </div>
          <div className="flex items-center gap-3">
            {attributes.isFetching && !attributes.isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Refreshing
              </span>
            ) : null}
            <Button
              type="button"
              className="cursor-pointer"
              onClick={() => setCreating(true)}
            >
              <Plus />
              New attribute
            </Button>
          </div>
        </div>
        <AttributesTable
          items={items}
          isLoading={attributes.isLoading}
          isFetching={attributes.isFetching}
          errorMessage={errorMessage}
          page={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => void attributes.refetch()}
          onEdit={setEditing}
          onDelete={setDeleting}
          onView={setViewing}
        />
      </section>

      <AttributeCreateDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={() => setPage(1)}
      />
      <AttributeDetailsDialog
        attribute={viewing}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        onEdit={(attribute) => {
          setViewing(null)
          setEditing(attribute)
        }}
      />
      <AttributeEditDialog
        attribute={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      />
      <AttributeDeleteDialog
        attribute={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          if (items.length === 1 && page > 1) {
            setPage(page - 1)
          }
        }}
      />
    </div>
  )
}
